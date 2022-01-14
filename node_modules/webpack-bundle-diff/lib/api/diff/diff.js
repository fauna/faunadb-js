"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = void 0;
const deriveBundleData_1 = require("../deriveBundleData/deriveBundleData");
const diffGraph_1 = require("./diffGraph");
const EnhancedModuleGraph_1 = require("./EnhancedModuleGraph");
const diffChunkGroups_1 = require("./diffChunkGroups");
function diff(baseline, comparison, options) {
    // Derive bundle data if necessary
    baseline = getBundleData(baseline, options);
    comparison = getBundleData(comparison, options);
    // Diff named chunk groups
    const results = diffChunkGroups_1.default(baseline, comparison);
    // Diff the graph
    diffGraph_1.default(new EnhancedModuleGraph_1.EnhancedModuleGraph(baseline.graph), new EnhancedModuleGraph_1.EnhancedModuleGraph(comparison.graph), results);
    return results;
}
exports.diff = diff;
function getBundleData(data, options) {
    return data.graph ? data : deriveBundleData_1.deriveBundleData(data, options);
}
