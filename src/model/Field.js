import {applyDefaults} from '../_util'

/**
 * Stores information about a field in a {@link Model}.
 */
export default class Field {
  /**
   * You don't need to call this directly;
   * this is called for you by {@link Model#setup} and {@link Model#addField}.
   *
   * @param {Codec} opts.codec
   *
   * @param {@Array<string>} opts.path
   *   If a model is created with `MyModel.setup(name, {x: {}, y: {}})`,
   *   the instance data will look like `{ref: ..., ts: ..., data: {x: ..., y: ...}}`.
   *
   *   You can override this by providing a different path.
   */
  constructor(opts) {
    Object.assign(this, applyDefaults(opts, {
      codec: null,
      path: null
    }))
  }
}