"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filterToChunkGroup_1 = require("./filterToChunkGroup");
const getWeight_1 = require("./getWeight");
function handleAddedModule(moduleName, baselineGraph, comparisonGraph, comparisonModule, chunkGroupName, chunkGroupDiff) {
    // The general idea here is to only report modules whose import was explicitly added (but not
    // all the downstream dependencies of those modules).  So, if some parent of an added module
    // was in the chunk group before, then we'll report it.  If all the parents were also added,
    // then we don't need to report it.
    // Get all parents in same chunk group
    const comparisonParents = filterToChunkGroup_1.default(comparisonModule.parents, chunkGroupName, comparisonGraph);
    if (!comparisonParents.length) {
        // The added module has no parents in this chunk group; it must be a new entry point
        chunkGroupDiff.added.push({
            module: moduleName,
            parents: [],
            weight: getWeight_1.getAddedWeight(moduleName, baselineGraph, comparisonGraph, chunkGroupName),
        });
    }
    else {
        // We're only interested in parents that were previously in this chunk group
        const previouslyExistingParents = comparisonParents.filter(p => baselineGraph.hasModule(p, chunkGroupName));
        // Only report this addition if it was imported from some module that was previously in the chunk group
        if (previouslyExistingParents.length) {
            chunkGroupDiff.added.push({
                module: moduleName,
                parents: previouslyExistingParents,
                weight: getWeight_1.getAddedWeight(moduleName, baselineGraph, comparisonGraph, chunkGroupName),
            });
        }
    }
}
exports.default = handleAddedModule;
