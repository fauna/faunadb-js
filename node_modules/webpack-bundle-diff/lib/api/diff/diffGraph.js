"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diffModuleNode_1 = require("./diffModuleNode");
function diffGraph(baselineGraph, comparisonGraph, results) {
    // Compare each module (the union of modules from both graphs)
    const allModules = new Set([
        ...baselineGraph.getAllModuleNames(),
        ...comparisonGraph.getAllModuleNames(),
    ]);
    for (let moduleName of allModules) {
        diffModuleNode_1.default(baselineGraph, comparisonGraph, moduleName, results);
    }
}
exports.default = diffGraph;
