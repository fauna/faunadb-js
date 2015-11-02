import {InvalidQuery, InvalidValue} from '../errors'
import {Page, Ref} from '../objects'
import PageStream from '../PageStream'
import * as query from '../query'
import {applyDefaults} from '../_util'
import Field from './Field'
import {calculateDiff, getPath, objectDup, setPath} from './_util'

/**
 * Base class for all models.
 *
 * Models represent database instances.
 * They link a FaunaDB class to a JavaScript class.
 *
 * The basic format is:
 *
 *     class MyModel extends Model {
 *       ... your methods ...
 *     }
 *     // define class name and fields
 *     MyModel.setup('my_models', {
 *       x: {},
 *       y: {converter: new RefConverter(MyModel)}
 *     })
 *
 * {@link Field}s will be constructed and
 * properties will be generated for each field passed to {@link setup}.
 *
 * {@link Class.createForModel} must be called before you can save model instances.
 */
export default class Model {
  /**
   * @param {string} faunaClassName
   * @param {object} fields
   *   Each `key: value` pair is the parameters for `addField`.
   */
  static setup(faunaClassName, fields={}) {
    this.faunaClassName = faunaClassName
    /**
     * {@link Ref} for the class itself.
     *
     * `instance.ref` should be the same as `new Ref(instance.constructor.classRef, instance.id)`.
     */
    this.classRef = new Ref('classes', faunaClassName)
    /** Object of all fields assigned to this class. */
    this.fields = {}
    for (const fieldName in fields)
      this.addField(fieldName, fields[fieldName])
  }

  /**
   * Adds a new field to the class, making getters and setters.
   *
   * @param {string} fieldName
   *   Name for the field. A getter and setter will be made with this name.
   *   If `fieldOpts.path` is not defined, it defaults to `['data', fieldName]`.
   * @param {object} fieldOpts
   *   Parameters for the {@link Field} constructor.
   */
  static addField(fieldName, fieldOpts={}) {
    if (fieldName === 'ref' || fieldName === 'ts')
      throw new Error('Forbidden field name.')

    if (fieldOpts.path == null)
      fieldOpts.path = ['data', fieldName]
    const field = new Field(fieldOpts)
    this.fields[fieldName] = field

    const {get, set} = field.codec === null ?
      {
        get() {
          return getPath(field.path, this._current)
        },
        set(value) {
          setPath(field.path, value, this._current)
        }
      } : {
        get() {
          const encoded = getPath(field.path, this._current)
          const decoded = field.codec.decode(encoded, this)
          return decoded
        },
        set(value) {
          const encoded = field.codec.encode(value, this)
          setPath(field.path, encoded, this._current)
        }
      }
    Object.defineProperty(this.prototype, fieldName, {get, set})
  }

  /**
   * Initialize (but do not save) a new instance.
   * @param {Client} client
   * @param {object} data Fields values for the new instance.
   */
  constructor(client, data) {
    /** Client instance that the model uses to save to the database. */
    this.client = client

    this._original = {}
    this._initState()

    for (const fieldName in data) {
      if (!(fieldName in this.constructor.fields))
        throw new InvalidValue(`No such field ${fieldName}`)
      // This calls the field's setter.
      this[fieldName] = data[fieldName]
    }
  }

  /** {@link Ref} of this instance in the database. `null` if {@link isNewInstance}. */
  get ref() {
    const ref = this._current.ref
    return ref === undefined ? null : ref
  }

  /** The id portion of this instance's {@link Ref}. Fails if {@link isNewInstance}. */
  get id() {
    return this.ref === null ? null : this.ref.id
  }

  /**
   * Microsecond UNIX timestamp of the latest {@link save}.
   * `null` if {@link isNewInstance}.
   */
  get ts() {
    const ts = this._current.ts
    return ts === undefined ? null : ts
  }

  /** For a field with a {@link Converter}, gets the encoded value. */
  getEncoded(fieldName) {
    const field = this.constructor.fields[fieldName]
    return getPath(field.path, this._current)
  }

  /** `false` if this has ever been saved to the database. */
  isNewInstance() {
    return !('ref' in this._current)
  }

  /**
   * Removes this instance from the database.
   * @return {Promise<Object>}
   */
  async delete() {
    return await this.client.query(this.deleteQuery())
  }

  /**
   * Query that deletes this instance.
   * @return {Object} A {@link delete_expr} expression.
   */
  deleteQuery() {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance does not exist in the database.')
    return query.delete_expr(this.ref)
  }

  /**
   * Executes {@link saveQuery}.
   * @param replace Same as for {@link saveQuery}.
   * @return {Promise<void>}
   */
  async save(replace=false) {
    this._initFromResource(await this.client.query(this.saveQuery(replace)))
  }

  /**
   * Query to save this instance to the database.
   * If {@link isNewInstance}, creates it and sets `ref` and `ts`.
   * Otherwise, updates any changed fields.
   *
   * @param replace
   *   If true, updates will update *all* fields
   *   using {@link replaceQuery} instead of {@link updateQuery}.
   *   See the [docs](https://faunadb.com/documentation/queries#write_functions).
   * @return {Object} A query expression, ready to use with {@link Client#query}.
   */
  saveQuery(replace=false) {
    return this.isNewInstance() ?
      this.createQuery() :
      replace ? this.replaceQuery() : this.updateQuery()
  }

  /**
   * Query to create a new instance.
   * @return {Object} A {@link create} expression.
   */
  createQuery() {
    if (!this.isNewInstance())
      throw new InvalidQuery('Trying to create instance that has already been created.')
    return query.create(this.constructor.classRef, query.quote(this._current))
  }

  /**
   * Query to replace this instance's data.
   * @return {Object} A {@link replace} expression.
   */
  replaceQuery() {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance has not yet been created.')
    return query.replace(this.ref, query.quote(this._current))
  }

  /**
   * Query to update this instance's data.
   * @return {Object} a {@link update} expression.
   */
  updateQuery() {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance has not yet been created.')
    return query.update(this.ref, query.quote(this._diff()))
  }

  /** A Model class is considered abstract if {@link setup} was never called. */
  static isAbstract() {
    return this.faunaClassName === undefined
  }

  /**
   * Gets the instance of this class specified by `ref`.
   * @param {Client} client
   * @param {Ref} ref Must be a reference to an instance of this class.
   * @return {Promise<this>} An instance of this class.
   */
  static async get(client, ref) {
    return this.getFromResource(client, await client.get(ref))
  }

  /**
   * Gets the instance of this class specified by `id`.
   * @param {Client} client
   * @param {number|string} instanceId `id` portion of a {@link Ref} for an instance of this class.
   * @return {Promise<this>} An instance of this class.
   */
  static async getById(client, instanceId) {
    return await this.get(client, new Ref(this.classRef, instanceId))
  }

  /**
   * Initializes and saves a new instance.
   * @param {Client} client
   * @param {Object} data Field values for the new instance.
   * @return {Promise<this>} An instance of this class.
   */
  static async create(client, data={}) {
    const instance = new this(client, data)
    instance._initFromResource(await client.post(this.classRef, instance._current))
    return instance
  }

  /**
   * Creates a new instance from query results.
   *
   * See also {@link get}.
   * @param {Client} client
   * @param {Object} resource Raw instance data, usually the result of a query.
   * @return {this} An instance of this class.
   */
  static getFromResource(client, resource) {
    const instance = new this(client)
    instance._initFromResource(resource)
    return instance
  }

  _initFromResource(resource) {
    if (!(typeof resource === 'object' && resource.constructor === Object))
      throw new Error('Expected to initialize from plain object resource.')
    const expectedClass = this.constructor.classRef
    if (!(resource.class instanceof Ref) || !resource.class.equals(expectedClass))
      throw new InvalidValue(
        `Trying to initialize from resource of class ${resource.class}; expected ${expectedClass}`)

    this._original = resource
    this._initState()
  }

  _initState() {
    // New JSON data of the instance.
    this._current = objectDup(this._original)
  }

  _diff() {
    return calculateDiff(this._original, this._current)
  }

  /**
   * Paginates a set query and converts results to instances of this class.
   *
   * @param {Client} client
   * @param instanceSet Query set of instances of this class.
   * @param pageParams Params to {@link paginate}.
   * @return {Promise<Page<this>>} Page whose elements are instances of this class.
   */
  static async page(client, instanceSet, pageParams={}) {
    return await this._mapPage(client, instanceSet, query.get, pageParams)
  }

  /**
   * Calls {@link Index#match} and then works just like {@link page}.
   *
   * @param {Index} index
   * @param matchedValues Values for {@link Index.match}.
   * @param pageParams Params to {@link query.paginate}.
   * @return {Promise<Page<this>>} Page whose elements are instances of this class.
   */
  static async pageIndex(index, matchedValues, pageParams={}) {
    if (!(matchedValues instanceof Array))
      matchedValues = [matchedValues]
    const client = index.client
    const matchSet = index.match(...matchedValues)
    const getter = indexRefGetter(index)
    return this._mapPage(client, matchSet, getter, pageParams)
  }

  static async _mapPage(client, instanceSet, pageLambda, pageParams) {
    const pageQuery = query.paginate(instanceSet, pageParams)
    const mapQuery = query.map(pageQuery, pageLambda)
    const page = Page.fromRaw(await client.query(mapQuery))
    return page.mapData(resource => this.getFromResource(client, resource))
  }

  /**
   * Stream for `instanceSet` that converts results to model instances.
   * @param {Client} client
   * @param instanceSet Query set of {@link Ref}s to instances of this class.
   * @param {number} opts.pageSize Size of each page.
   * @return {PageStream<this>} Stream whose elements are instances of this class.
   */
  static stream(client, instanceSet, opts={}) {
    const {pageSize} = applyDefaults(opts, {
      pageSize: undefined
    })
    return PageStream.elements(client, instanceSet, {
      pageSize,
      mapLambda: query.get
    }).map(instance => this.getFromResource(client, instance))
  }

  /**
   * Calls {@link Index#match} and then works just like {@link pageStream}.
   *
   * @param {Index} index Index whose instances are instances of this class.
   * @param matchedValues Matched value or array of matched values, passed into {@link Index.match}.
   * @param {number} opts.pageSize Size of each page.
   * @return {PageStream<this>} Stream whose elements are instances of this class.
   */
  static streamIndex(index, matchedValues, opts={}) {
    const {pageSize} = applyDefaults(opts, {
      pageSize: undefined
    })
    const client = index.client
    if (!(matchedValues instanceof Array))
      matchedValues = [matchedValues]
    const matchSet = index.match(...matchedValues)
    return PageStream.elements(client, matchSet, {
      pageSize,
      mapLambda: indexRefGetter(index)
    }).map(instance => this.getFromResource(client, instance))
  }

  /**
   * Returns the first instance matched by the index.
   * @param {Index} index
   * @param matchedValues Same as for {@link Index.match}.
   * @return {Promise<this>} Instance of this class.
   */
  static async getFromIndex(index, ...matchedValues) {
    return this.getFromResource(index.client, await index.getSingle(...matchedValues))
  }

  /** @ignore */
  toString() {
    const fields = Object.keys(this.constructor.fields).map(key =>
      `${key}: ${this[key]}`).join(', ')
    return `${this.constructor.name}(${fields})`
  }
}

/** Lambda expression for getting an instance Ref out of a match result. */
function indexRefGetter(index) {
  return index.values ?
    arr => query.get(query.select(index.values.length, arr)) :
    query.get
}
