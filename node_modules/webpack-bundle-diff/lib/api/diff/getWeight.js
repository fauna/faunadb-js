"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemovedWeight = exports.getAddedWeight = void 0;
// Calculate weight incurred by an added module and its dependencies
function getAddedWeight(moduleName, baseline, comparison, chunkGroupName) {
    return getModuleWeight(moduleName, comparison, baseline, chunkGroupName);
}
exports.getAddedWeight = getAddedWeight;
// Calculate weight reduced by removing a module and its dependencies
function getRemovedWeight(moduleName, baseline, comparison, chunkGroupName) {
    return getModuleWeight(moduleName, baseline, comparison, chunkGroupName);
}
exports.getRemovedWeight = getRemovedWeight;
function getModuleWeight(moduleName, targetGraph, oppositeGraph, chunkGroupName) {
    const visited = new Set();
    const weight = {
        moduleCount: 0,
        size: 0,
        modules: [],
    };
    getImportWeightRecursive(moduleName, targetGraph, oppositeGraph, chunkGroupName, weight, visited);
    return weight;
}
function getImportWeightRecursive(moduleName, targetGraph, oppositeGraph, chunkGroupName, weight, visited) {
    // If this node has already been visited, bail out
    if (visited.has(moduleName)) {
        return;
    }
    else {
        visited.add(moduleName);
    }
    // If we've hit a module outside the chunk group, bail out
    if (!targetGraph.hasModule(moduleName, chunkGroupName)) {
        return;
    }
    // If we've hit a module that is also in the opposite graph, bail out.  E.g. if we're
    // calculating added weight but the module also existed in the baseline graph, it doesn't
    // count; or if we're calculating removed weight but the module still exists in the comparison
    // graph, it doesn't count.
    if (oppositeGraph.hasModule(moduleName, chunkGroupName)) {
        return;
    }
    // Account for this module
    const module = targetGraph.getModule(moduleName);
    weight.moduleCount++;
    weight.size += module.size;
    weight.modules.push(moduleName);
    // Visit children
    for (let child of module.children) {
        getImportWeightRecursive(child, targetGraph, oppositeGraph, chunkGroupName, weight, visited);
    }
}
