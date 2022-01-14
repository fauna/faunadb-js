"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper class to map module IDs to module names
class ModuleIdToNameMap {
    constructor(stats) {
        // Initialize the map from the given stats
        this.map = new Map();
        for (let module of stats.modules) {
            // If the module contains multiple hoisted modules, assume the first one is the primary module
            let name = module.modules ? module.modules[0].name : module.name;
            this.map.set(module.id, name);
        }
    }
    get(id) {
        return this.map.get(id);
    }
}
exports.default = ModuleIdToNameMap;
