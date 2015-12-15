import AsyncStream from '../AsyncStream'
import Client from '../Client'
import {InvalidQuery, InvalidValue} from '../errors'
import {Page, Ref} from '../objects'
import PageStream from '../PageStream'
import {PaginateOptions, Query} from '../query'
import * as query from '../query'
import {applyDefaults} from '../_util'
import {Index} from './Builtin'
import Field, {FieldOptions} from './Field'
import {calculateDiff, getPath, objectDup, setPath} from './_util'

// TODO: Want to use `this` in static methods
// https://github.com/Microsoft/TypeScript/issues/5863
// https://github.com/Microsoft/TypeScript/issues/3694
export type SelfType = any

/**
Base class for all models.

Models represent database instances.
They link a FaunaDB class to a JavaScript class.

The basic format is:

    class MyModel extends Model {
      ... your methods ...
    }
    // define class name and fields
    MyModel.setup('my_models', {
      x: {},
      y: {converter: new RefConverter(MyModel)}
    })

[[Field]]s will be constructed and
properties will be generated for each field passed to [[setup]].

[[Class.createForModel]] must be called before you can save model instances.
*/
export default class Model {
  /**
  Ref for this class.
  `instance.ref` should be the same as `new Ref(instance.constructor.classRef, instance.id)`.*/
  static classRef: Ref
  /** Name of this class in the database. Normally set by [[setup]]. */
  static faunaClassName: string
  /** Object containing each field that this class recognizes. */
  static fields: {[key: string]: Field<{}>}

  /**
  @param fields Each `key: value` pair is the parameters for `addField`.
  */
  static setup(faunaClassName: string, fields: {[key: string]: FieldOptions<{}>}): void {
    this.faunaClassName = faunaClassName
    this.classRef = new Ref('classes', faunaClassName)
    this.fields = {}
    for (const fieldName in fields)
      this.addField(fieldName, fields[fieldName])
  }

  /**
   * Adds a new field to the class, making getters and setters.
   *
   * @param fieldName
   *   Name for the field. A getter and setter will be made with this name.
   *   If `fieldOpts.path` is not defined, it defaults to `['data', fieldName]`.
   * @param fieldOpts Parameters for the [[Field]] constructor.
   */
  static addField(fieldName: string, fieldOpts: any = {}): void {
    if (fieldName === 'ref' || fieldName === 'ts')
      throw new Error('Forbidden field name.')

    if (fieldOpts.path === null || fieldOpts.path === undefined)
      fieldOpts.path = ['data', fieldName]
    const field = new Field(fieldOpts)
    this.fields[fieldName] = field

    const {getter, setter} = field.codec === null ?
      {
        getter(): any {
          return getPath(field.path, this.current)
        },
        setter(value: any): void {
          setPath(field.path, value, this.current)
        }
      } : {
        getter(): any {
          const encoded = getPath(field.path, this.current)
          const decoded = field.codec.decode(encoded)
          return decoded
        },
        setter(value: any): void {
          const encoded = field.codec.encode(value)
          setPath(field.path, encoded, this.current)
        }
      }
    Object.defineProperty(this.prototype, fieldName, {get: getter, set: setter})
  }

  /** Client instance that the model uses to save to the database. */
  client: Client
  private original: any
  private current: any

  /**
   * Initialize (but do not save) a new instance.
   * @param data Fields values for the new instance.
   */
  constructor(client: Client, data: any = {}) {
    this.client = client

    this.original = {}
    this.initState()

    for (const fieldName in data) {
      if (!(fieldName in this.class.fields))
        throw new InvalidValue(`No such field ${fieldName}`);
      // This calls the field's setter.
      (<any> this)[fieldName] = data[fieldName]
    }
  }

  /** [[Ref]] of this instance in the database. `null` if [[isNewInstance]]. */
  get ref(): Ref {
    const ref = this.current.ref
    return ref === undefined ? null : ref
  }

  /** The id portion of this instance's [[Ref]]. Fails if [[isNewInstance]]. */
  get id(): string {
    return this.ref === null ? null : this.ref.id
  }

  /**
   * Microsecond UNIX timestamp of the latest [[save]].
   * `null` if [[isNewInstance]].
   */
  get ts(): number {
    const ts = this.current.ts
    return ts === undefined ? null : ts
  }

  /** For a field with a [[Converter]], gets the encoded value. */
  getEncoded(fieldName: string): any {
    const field = this.class.fields[fieldName]
    return getPath(field.path, this.current)
  }

  /** `false` if this has ever been saved to the database. */
  isNewInstance(): boolean {
    return !('ref' in this.current)
  }

  /** Removes this instance from the database. */
  async delete(): Promise<any> {
    return await this.client.query(this.deleteQuery())
  }

  /**
   * Query that deletes this instance.
   * @return A [[delete_expr]] expression.
   */
  deleteQuery(): Query {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance does not exist in the database.')
    return query.delete_expr(this.ref)
  }

  /**
   * Executes [[saveQuery]].
   * @param replace Same as for [[saveQuery]].
   */
  async save(replace: boolean = false): Promise<void> {
    this.initFromResource(await this.client.query(this.saveQuery(replace)))
  }

  /**
   * Query to save this instance to the database.
   * If [[isNewInstance]], creates it and sets `ref` and `ts`.
   * Otherwise, updates any changed fields.
   *
   * @param replace
   *   If true, updates will update *all* fields
   *   using [[replaceQuery]] instead of [[updateQuery]].
   *   See the [docs](https://faunadb.com/documentation/queries#write_functions).
   * @return A query expression, ready to use with [[Client#query]].
   */
  saveQuery(replace: boolean = false): Query {
    return this.isNewInstance() ?
      this.createQuery() :
      replace ? this.replaceQuery() : this.updateQuery()
  }

  /**
   * Query to create a new instance.
   * @return A [[create]] expression.
   */
  createQuery(): Query {
    if (!this.isNewInstance())
      throw new InvalidQuery('Trying to create instance that has already been created.')
    return query.create(this.class.classRef, query.quote(this.current))
  }

  /**
   * Query to replace this instance's data.
   * @return A [[replace]] expression.
   */
  replaceQuery(): Query {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance has not yet been created.')
    return query.replace(this.ref, query.quote(this.current))
  }

  /**
   * Query to update this instance's data.
   * @return A [[update]] expression.
   */
  updateQuery(): Query {
    if (this.isNewInstance())
      throw new InvalidQuery('Instance has not yet been created.')
    return query.update(this.ref, query.quote(this.diff()))
  }

  /** A Model class is considered abstract if [[setup]] was never called. */
  static get isAbstract(): boolean {
    return this.faunaClassName === undefined
  }

  /**
   * Gets the instance of this class specified by `ref`.
   * @param ref Must be a reference to an instance of this class.
   * @return An instance of this class.
   */
  static async get(client: Client, ref: Ref): Promise<SelfType> {
    return this.getFromResource(client, await client.get(ref))
  }

  /**
   * Gets the instance of this class specified by `id`.
   * @param instanceId `id` portion of a [[Ref]] for an instance of this class.
   * @return An instance of this class.
   */
  static async getById(client: Client, instanceId: string): Promise<SelfType> {
    return await this.get(client, new Ref(this.classRef, instanceId))
  }

  /**
   * Initializes and saves a new instance.
   * @param data Field values for the new instance.
   * @return An instance of this class.
   */
  static async create(client: Client, data: any = {}): Promise<SelfType> {
    const instance = new this(client, data)
    instance.initFromResource(await client.post(this.classRef, instance.current))
    return instance
  }

  /**
   * Creates a new instance from query results.
   *
   * See also [[get]].
   * @param resource Raw instance data, usually the result of a query.
   * @return An instance of this class.
   */
  static getFromResource(client: Client, resource: any): SelfType {
    const instance = new this(client)
    instance.initFromResource(resource)
    return instance
  }

  private initFromResource(resource: any): void {
    if (!(typeof resource === 'object' && resource.constructor === Object))
      throw new Error('Expected to initialize from plain object resource.')
    const expectedClass = this.class.classRef
    if (!(resource.class instanceof Ref) || !resource.class.equals(expectedClass))
      throw new InvalidValue(
        `Trying to initialize from resource of class ${resource.class}; expected ${expectedClass}`)

    this.original = resource
    this.initState()
  }

  private initState(): void {
    // New JSON data of the instance.
    this.current = objectDup(this.original)
  }

  private diff(): any {
    return calculateDiff(this.original, this.current)
  }

  /**
   * Paginates a set query and converts results to instances of this class.
   * @param instanceSet Query set of instances of this class.
   * @param pageParams Params to [[paginate]].
   * @return Page whose elements are instances of this class.
   */
  static async page(
    client: Client,
    instanceSet: Query,
    pageParams: PaginateOptions = {}): Promise<Page<SelfType>> {
    return await this.mapPage(client, instanceSet, query.get, pageParams)
  }

  /**
   * Calls [[Index#match]] and then works just like [[page]].
   * @param matchedValues Values for [[Index.match]].
   * @param pageParams Params to [[query.paginate]].
   * @return Page whose elements are instances of this class.
   */
  static async pageIndex(
    index: Index,
    matchedValues: any,
    pageParams: PaginateOptions = {}): Promise<Page<SelfType>> {
    if (!(matchedValues instanceof Array))
      matchedValues = [matchedValues]
    const client = index.client
    const matchSet = index.match(...matchedValues)
    const getter = indexRefGetter(index)
    return this.mapPage(client, matchSet, getter, pageParams)
  }

  private static async mapPage(
    client: Client,
    instanceSet: Query,
    pageLambda: Query,
    pageParams: PaginateOptions): Promise<Page<SelfType>> {
    const pageQuery = query.paginate(instanceSet, pageParams)
    const mapQuery = query.map(pageQuery, pageLambda)
    const page = Page.fromRaw(await client.query(mapQuery))
    return page.mapData((resource: any) => this.getFromResource(client, resource))
  }

  /**
   * Stream for `instanceSet` that converts results to model instances.
   * @param instanceSet Query set of [[Ref]]s to instances of this class.
   * @return Stream whose elements are instances of this class.
   */
  static stream(
    client: Client,
    instanceSet: Query,
    opts: {pageSize?: number} = {}): AsyncStream<SelfType> {
    const {pageSize} = applyDefaults(opts, {
      pageSize: undefined
    })
    return PageStream.elements(client, instanceSet, {
      pageSize,
      mapLambda: query.get
    }).map((resource: any) => this.getFromResource(client, resource))
  }

  /**
   * Calls [[Index#match]] and then works just like [[pageStream]].
   * @param index Index whose instances are instances of this class.
   * @param matchedValues Matched value or array of matched values, passed into [[Index.match]].
   * @return Stream whose elements are instances of this class.
   */
  static streamIndex(
    index: Index,
    matchedValues: any,
    opts: {pageSize?: number} = {}): AsyncStream<SelfType> {
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
    }).map((resource: any) => this.getFromResource(client, resource))
  }

  /**
   * Returns the first instance matched by the index.
   * @param matchedValues Same as for [[Index.match]].
   * @return Instance of this class.
   */
  static async getFromIndex(index: Index, ...matchedValues: Array<any>): Promise<SelfType> {
    return this.getFromResource(index.client, await index.getSingle(...matchedValues))
  }

  /** @ignore */
  toString(): string {
    const fields = Object.keys(this.class.fields).map((key: string) =>
      `${key}: ${(<any> this)[key]}`).join(', ')
    return `${this.constructor.name}(${fields})`
  }

  // TODO: similar problem to SelfType
  private get class(): ModelClass {
    return <any> this.constructor
  }
}
// KLUDGE - fixed in typescript 1.8
exports.default = Model

export interface ModelClass {
  classRef: Ref
  faunaClassName: string
  fields: {[key: string]: Field<{}>}
  new(client: Client, data: any) : Model
}

/** Lambda expression for getting an instance Ref out of a match result. */
function indexRefGetter(index: Index): Query {
  if (index.values !== null) {
    const lastIndex = index.values.length - 1
    if (index.values[lastIndex].path !== 'ref')
      throw new Error('Can only get model from index if last of index.values is a Ref.')
    return query.lambda((arr) => query.get(query.select(lastIndex, arr)))
  } else
    return query.lambda(query.get)
}
