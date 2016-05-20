var util = require('../_util');

/**
 * Stores information about a field in a {@link Model}.
 */
function Field(opts) {
  Object.assign(this, util.applyDefaults(opts, {
    codec: null,
    path: null
  }));
}

module.exports = Field;