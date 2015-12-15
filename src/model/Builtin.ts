'use strict'

import Client from '../Client'
import {Ref} from '../objects'
import {Query} from '../query'
import * as query from '../query'
import {RefCodec} from './Codec'
import {FieldOptions} from './Field'
import Model, {ModelClass} from './Model'

/**
Builtins are special classes that exist by default.
If you want to store custom data, you can add new fields with e.g. `Database.addField`.
*/
export default class Builtin extends Model {
  /** @private */
  static setup(faunaClassName: string, fields: {[key: string]: FieldOptions<{}>}): void {
    super.setup(faunaClassName, fields)
    if (this.isAbstract)
      throw new Error()
    // classRef does not have 'classes' in front
    this.classRef = new Ref(this.faunaClassName)
    for (const fieldName in this.fields)
      // Builtin fields do not have 'data' in front of path
      this.fields[fieldName].path = [fieldName]
  }
}
// KLUDGE - fixed in typescript 1.8
exports.default = Builtin

/** See the [docs](https://faunadb.com/documentation/objects#databases). */
export class Database extends Builtin {
  name: string
  api_version: string
}
Database.setup('databases', {name: {}, api_version: {}})

/** See the [docs](https://faunadb.com/documentation/objects#keys). */
export class Key extends Builtin {
  database: Ref
  role: string
  secret: string
  hashed_secret: string
}
Key.setup('keys', {
  database: {codec: RefCodec},
  role: {},
  secret: {},
  hashed_secret: {}
})

/** See the [docs](https://faunadb.com/documentation/objects#classes). */
export class Class extends Builtin {
  /**
  Creates a Class for the [[Model]] class.
  @param data Field values for the Class object.
  */
  static async createForModel(
    client: Client,
    modelClass: ModelClass,
    data: ClassOptions = {}): Promise<Class> {
    return await this.create(client, Object.assign({name: modelClass.faunaClassName}, data))
  }

  /** Gets the Class associated with a [[Model]] class. */
  static async getForModel(client: Client, modelClass: ModelClass): Promise<Class> {
    return await this.get(client, modelClass.classRef)
  }

  name: string
  history_days: number
  ttl_days: number
  permissions: Permissions
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
  Creates an Index for a [[Model]] class.
  The index may not be usable immediately. See the docs.
  @param data Field values for the Index object.
  */
  static async createForModel(
    client: Client,
    modelClass: ModelClass,
    name: string,
    terms: string | Array<{path: string}>,
    data: IndexOptions = {}): Promise<Index> {
    if (typeof terms === 'string')
      terms = [{path: `data.${terms}`}]
    const source = await Class.getForModel(client, modelClass)
    return await this.create(client, Object.assign({source: source.ref, name, terms}, data))
  }

  /**
  Set query representing all instances whose value matches the index's term.

  See also [[Model.pageIndex]] and [[Model.streamIndex]].
  @param matchedValues For each of `this.terms`, a value to match it.
  @return A query set made by [[match]].
  */
  match(...matchedValues: Array<any>): Query {
    // Make query slightly neater by only using array if necessary.
    if (matchedValues.length === 1)
      matchedValues = matchedValues[0]
    return query.match(matchedValues, this.ref)
  }

  /**
  Returns raw data of the first instance matched by this index.
  Typically this will be used for an index with `unique: true`.
  See also [[Model.getFromIndex]].
  @param matchedValues Same as for [[match]].
  */
  async getSingle(...matchedValues: Array<any>): Promise<Object> {
    return await this.client.query(query.get(this.match(...matchedValues)))
  }

  name: string
  source: Ref
  terms: Array<IndexTerm>
  values: Array<IndexValue>
  unique: boolean
  permissions: Permissions
  active: boolean
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
Index over all instances of a class.
Not a different faunadb class; just a specialized Index.
*/
export class ClassIndex extends Index {
  /**
  Creates a class index for the given model.
  If the model is `classes/xyz`, the class index will be `indexes/xyz`.
  @param client
  @param modelClass
  @param data Field values for the ClassIndex object.
  */
  static async createForModel(
    client: Client,
    modelClass: ModelClass,
    data: any = {}): Promise<ClassIndex> {
    const name = modelClass.faunaClassName
    const source = await Class.getForModel(client, modelClass)
    const terms = [{path: 'class'}]
    return await ClassIndex.create(client, Object.assign({source: source.ref, name, terms}, data))
  }

  /** Fetches the class index. */
  static async getForModel(client: Client, modelClass: ModelClass): Promise<ClassIndex> {
    return await ClassIndex.getById(client, modelClass.faunaClassName)
  }

  /**
  Query set of all instances of the class.
  @return A query set made by [[match]].
  */
  match(): Query {
    return query.match(this.getEncoded('source'), this.ref)
  }
}

export type ClassOptions = {
  history_days?: number,
  ttl_days?: number,
  permissions?: Permissions
}

export type IndexOptions = {
  values?: Array<IndexValue>,
  unique?: boolean,
  permisisons?: Permissions,
  active?: boolean
}

export type IndexTerm = {
  path: string
}

export type IndexValue = {
  path: string,
  reverse?: boolean
}

export type Permissions = {
  read: any
}
