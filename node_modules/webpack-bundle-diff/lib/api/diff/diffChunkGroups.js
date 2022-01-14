"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function diffChunkGroups(baseline, comparison) {
    const results = {};
    // Iterate over all chunk groups
    const allChunkGroups = new Set([
        ...Object.keys(baseline.chunkGroups),
        ...Object.keys(comparison.chunkGroups),
    ]);
    for (let chunkGroupName of allChunkGroups) {
        const baselineChunkGroup = baseline.chunkGroups[chunkGroupName];
        const comparisonChunkGroup = comparison.chunkGroups[chunkGroupName];
        let delta;
        if (!baselineChunkGroup) {
            // New chunk group was added
            delta = comparisonChunkGroup.size;
        }
        else if (!comparisonChunkGroup) {
            // Chunk group was removed
            delta = -baselineChunkGroup.size;
        }
        else {
            // Chunk group existed before and after
            delta = comparisonChunkGroup.size - baselineChunkGroup.size;
        }
        // Initialize the entry for the chunk group diff
        results[chunkGroupName] = { delta, added: [], removed: [], changed: [] };
    }
    return results;
}
exports.default = diffChunkGroups;
