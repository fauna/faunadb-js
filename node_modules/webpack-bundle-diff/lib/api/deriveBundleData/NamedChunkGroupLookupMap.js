"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper class to look up what named chunk groups a given chunk is in
class NamedChunkGroupLookupMap {
    constructor(stats) {
        // Initialize the map from the given stats
        this.map = new Map();
        for (let name of Object.keys(stats.namedChunkGroups)) {
            const chunkGroup = stats.namedChunkGroups[name];
            for (let chunkId of chunkGroup.chunks) {
                if (!this.map.has(chunkId)) {
                    this.map.set(chunkId, []);
                }
                this.map.get(chunkId).push(name);
            }
        }
    }
    getNamedChunkGroups(chunks) {
        // Use a set to avoid duplication
        const namedChunkGroups = new Set();
        // Accumulate from all the chunks
        for (let chunkId of chunks) {
            if (this.map.has(chunkId)) {
                for (let namedChunkGroup of this.map.get(chunkId)) {
                    namedChunkGroups.add(namedChunkGroup);
                }
            }
        }
        return [...namedChunkGroups];
    }
}
exports.default = NamedChunkGroupLookupMap;
