import assert from 'assert'
import {Ref} from '../objects'
import * as query from '../query'
import {RefCodec} from './Codec'
import Model from './Model'

/**
 * Builtins are special classes that exist by default.
 * If you want to store custom data, you can add new fields with e.g. `Database.addField`.
 */
export default class Builtin extends Model {
  /** @private */
  static setup(...args) {
    // todo: babel bug, want to write:
    // super.setup(...args)
    super.setup.apply(this, args)
    assert(!this.isAbstract())
    // classRef does not have 'classes' in front
    this.classRef = new Ref(this.faunaClassName)
    for (const fieldName in this.fields)
      // Builtin fields do not have 'data' in front of path
      this.fields[fieldName].path = [fieldName]
  }
}

/** See the [docs](https://faunadb.com/documentation/objects#databases). */
export class Database extends Builtin { }
Database.setup('databases', {name: {}, api_version: {}})

/** See the [docs](https://faunadb.com/documentation/objects#keys). */
export class Key extends Builtin { }
Key.setup('keys', {
  database: {codec: RefCodec},
  role: {},
  secret: {},
  hashed_secret: {}
})

/** See the [docs](https://faunadb.com/documentation/objects#classes). */
export class Class extends Builtin {
  /**
   * Creates a Class for the {@link Model} class.
   * @param {Client} client
   * @param {Function} modelClass
   * @param {Object} data Field values for the Class object.
   * @return {Promise<Class>}
   */
  static async createForModel(client, modelClass, data={}) {
    return await this.create(client, Object.assign({name: modelClass.faunaClassName}, data))
  }

  /**
   * Gets the Class associated with a {@link Model} class.
   * @param {Client} client
   * @param {Function} modelClass
   * @return {Promise<Class>}
   */
  static async getForModel(client, modelClass) {
    return await this.get(client, modelClass.classRef)
  }
}
Class.setup('classes', {
  name: {},
  history_days: {},
  ttl_days: {},
  permissions: {}
})

/** See the [docs](https://faunadb.com/documentation/objects#indexes). */
export class Index extends Builtin {
  /**
   * Creates an Index for a {@link Model} class.
   * The index may not be usable immediately. See the docs.
   * @param {Client} client
   * @param {Function} modelClass
   * @param {string} name
   * @param {string|Array<{path: string}>} terms
   * @param {Object} data Field values for the Index object.
   * @return {Promise<Index>}
   */
  static async createForModel(client, modelClass, name, terms, data={}) {
    if (typeof terms === 'string')
      terms = [{path: `data.${terms}`}]
    const source = await Class.getForModel(client, modelClass)
    return await this.create(client, Object.assign({source: source.ref, name, terms}, data))
  }

  /**
   * Set query representing all instances whose value matches the index's term.
   *
   * See also {@link Model.pageIndex} and {@link Model.streamIndex}.
   * @param matchedValues For each of `this.terms`, a value to match it.
   * @return {object} A query set made by {@link match}.
   */
  match(...matchedValues) {
    // Make query slightly neater by only using array if necessary.
    if (matchedValues.length === 1)
      matchedValues = matchedValues[0]
    return query.match(this.ref, matchedValues)
  }

  /**
   * Returns raw data of the first instance matched by this index.
   * Typically this will be used for an index with `unique: true`.
   * See also {@link Model.getFromIndex}.
   * @param matchedValues Same as for {@link match}.
   * @return {Promise<Object>}
   */
  async getSingle(...matchedValues) {
    return await this.client.query(query.get(this.match(...matchedValues)))
  }
}
Index.setup('indexes', {
  name: {},
  source: {codec: RefCodec},
  terms: {},
  values: {},
  unique: {},
  permissions: {},
  active: {}
})
