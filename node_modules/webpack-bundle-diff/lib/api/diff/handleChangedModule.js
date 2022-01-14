"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleChangedModule(moduleName, baselineModule, comparisonModule, chunkGroupDiff) {
    // Only record non-zero deltas
    const delta = comparisonModule.size - baselineModule.size;
    if (delta) {
        chunkGroupDiff.changed.push({
            module: moduleName,
            delta,
        });
    }
}
exports.default = handleChangedModule;
