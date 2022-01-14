"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Filter a list of modules to those that exist in the given chunk group
function filterToChunkGroup(modules, chunkGroupName, graph) {
    return modules.filter(m => graph.hasModule(m, chunkGroupName));
}
exports.default = filterToChunkGroup;
