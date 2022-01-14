"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleAddedModule_1 = require("./handleAddedModule");
const handleChangedModule_1 = require("./handleChangedModule");
const handleRemovedModule_1 = require("./handleRemovedModule");
function diffModuleNode(baselineGraph, comparisonGraph, moduleName, results) {
    const baselineModule = baselineGraph.getModule(moduleName);
    const comparisonModule = comparisonGraph.getModule(moduleName);
    const baselineChunkGroups = getNamedChunkGroups(baselineModule);
    const comparisonChunkGroups = getNamedChunkGroups(comparisonModule);
    const allChunkGroups = new Set([...baselineChunkGroups, ...comparisonChunkGroups]);
    // Check whether this module was added, removed, or changed within each chunk group
    for (let chunkGroupName of allChunkGroups) {
        let chunkGroupDiff = results[chunkGroupName];
        if (!baselineChunkGroups.has(chunkGroupName)) {
            handleAddedModule_1.default(moduleName, baselineGraph, comparisonGraph, comparisonModule, chunkGroupName, chunkGroupDiff);
        }
        else if (!comparisonChunkGroups.has(chunkGroupName)) {
            handleRemovedModule_1.default(moduleName, baselineGraph, comparisonGraph, baselineModule, chunkGroupName, chunkGroupDiff);
        }
        else {
            handleChangedModule_1.default(moduleName, baselineModule, comparisonModule, chunkGroupDiff);
        }
    }
}
exports.default = diffModuleNode;
// Get the set of named chunk groups for a module, accounting for null
function getNamedChunkGroups(module) {
    return new Set((module && module.namedChunkGroups) || []);
}
