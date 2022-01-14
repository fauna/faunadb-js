"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedModuleGraph = void 0;
class EnhancedModuleGraph {
    constructor(moduleGraph) {
        // First pass: just copy the original graph
        this.graph = new Map();
        for (let moduleName of Object.keys(moduleGraph)) {
            this.graph.set(moduleName, Object.assign(Object.assign({}, moduleGraph[moduleName]), { children: [] }));
        }
        // Second pass: fill in the children links
        for (let moduleName of this.graph.keys()) {
            for (let parentModuleName of this.graph.get(moduleName).parents) {
                this.graph.get(parentModuleName).children.push(moduleName);
            }
        }
    }
    getModule(moduleName) {
        return this.graph.get(moduleName);
    }
    hasModule(moduleName, chunkGroupName) {
        // Check if the module exists (optionally checking if it exists in a given chunk group)
        const module = this.getModule(moduleName);
        return module && (!chunkGroupName || module.namedChunkGroups.indexOf(chunkGroupName) >= 0);
    }
    getAllModuleNames() {
        return this.graph.keys();
    }
}
exports.EnhancedModuleGraph = EnhancedModuleGraph;
