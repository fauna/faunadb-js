"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBundleData = void 0;
const deriveGraph_1 = require("./deriveGraph");
const deriveChunkGroupData_1 = require("./deriveChunkGroupData");
function deriveBundleData(stats, options) {
    return {
        graph: deriveGraph_1.deriveGraph(stats),
        chunkGroups: deriveChunkGroupData_1.deriveChunkGroupData(stats, options),
    };
}
exports.deriveBundleData = deriveBundleData;
