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
    super.setup(...args)
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
  /** Creates a class for the {@link Model}. */
  static async createForModel(client, modelClass, data={}) {
    return await this.create(client, Object.assign({name: modelClass.faunaClassName}, data))
  }

  /** Gets the class associated with a {@link Model}. */
  static async getForModel(client, modelClass) {
    try {
      await this.get(client, modelClass.classRef)
    } catch (err) {
      console.log(err)
      console.log(err.stack)
    }

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
   */
  static async createForModel(client, modelClass, name, terms, data={}) {
    if (typeof terms === 'string')
      terms = [{path: `data.${terms}`}]
    const source = await Class.getForModel(client, modelClass)
    return await this.create(client, Object.assign({source: source.ref, name, terms}, data))
  }

  /**
   * Set query representing all instances whose value matches the index's term.
   * See also {@link Model#pageIndex} and {@link Model#pageIteratorForIndex}.
   */
  match(...matchedValues) {
    // Make query slightly neater by only using array if necessary.
    if (matchedValues.length === 1)
      matchedValues = matchedValues[0]
    return query.match(matchedValues, this.ref)
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

/**
 * Index over all instances of a class.
 * Not a different faunadb class; just a specialized Index.
 */
export class ClassIndex extends Index {
  /**
   * Creates a class index for the given model.
   * If the model is `classes/xyz`, the class index will be `indexes/xyz`.
   */
  static async createForModel(client, modelClass, data={}) {
    const name = modelClass.faunaClassName
    const source = await Class.getForModel(client, modelClass)
    const terms = [{path: 'class'}]
    return await ClassIndex.create(client, Object.assign({source: source.ref, name, terms}, data))
  }

  /** Fetches the class index. */
  static async getForModel(client, modelClass) {
    return await ClassIndex.getById(client, modelClass.faunaClassName)
  }

  /** Query set of all instances of the class. */
  match() {
    return query.match(this.getEncoded('source'), this.ref)
  }
}
