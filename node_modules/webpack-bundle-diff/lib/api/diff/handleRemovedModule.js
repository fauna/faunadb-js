"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filterToChunkGroup_1 = require("./filterToChunkGroup");
const getWeight_1 = require("./getWeight");
function handleRemovedModule(moduleName, baselineGraph, comparisonGraph, baselineModule, chunkGroupName, chunkGroupDiff) {
    // The general idea here is to only report modules whose import was explicitly removed (but
    // not all the downstream dependencies of those modules).  So, if some parent of a removed
    // module is still in the chunk group, then we'll report it.  If all the parents were also
    // removed, then we don't need to report it.
    // Get all parents that were in same chunk group
    const baselineParents = filterToChunkGroup_1.default(baselineModule.parents, chunkGroupName, baselineGraph);
    if (!baselineParents.length) {
        // The removed module had no parents in this chunk group; it must have been an entry point
        chunkGroupDiff.removed.push({
            module: moduleName,
            parents: [],
            weight: getWeight_1.getRemovedWeight(moduleName, baselineGraph, comparisonGraph, chunkGroupName),
        });
    }
    else {
        // We're only interested in parents that are still in this chunk group
        const stillExistingParents = baselineParents.filter(p => comparisonGraph.hasModule(p, chunkGroupName));
        // Only report this removal if it was imported from some module that is still in the chunk group
        if (stillExistingParents.length) {
            chunkGroupDiff.removed.push({
                module: moduleName,
                parents: stillExistingParents,
                weight: getWeight_1.getRemovedWeight(moduleName, baselineGraph, comparisonGraph, chunkGroupName),
            });
        }
    }
}
exports.default = handleRemovedModule;
