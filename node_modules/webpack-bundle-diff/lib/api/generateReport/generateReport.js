"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
function generateReport(diff, options) {
    const lines = [];
    const chunkGroups = (options && options.chunkGroups) || Object.keys(diff);
    const transform = (options && options.moduleNameTransform) || (name => name);
    const threshold = (options && options.threshold) || 100;
    for (let chunkGroupName of chunkGroups) {
        if (diff[chunkGroupName]) {
            reportChunkGroup(chunkGroupName, diff[chunkGroupName], lines, transform, threshold);
        }
    }
    if (!lines.length) {
        return '## No changes to report';
    }
    return lines.join('\n');
}
exports.generateReport = generateReport;
function reportChunkGroup(chunkGroupName, chunkGroupDiff, lines, transform, threshold) {
    // If there are no changes in the chunk group, don't report it
    if (!chunkGroupDiff.added.length &&
        !chunkGroupDiff.removed.length &&
        !chunkGroupDiff.changed.length) {
        return;
    }
    lines.push(`## ${chunkGroupName} (${formatDelta(chunkGroupDiff.delta)} bytes)`);
    lines.push('');
    // Header
    lines.push('|| Module | Count | Size |');
    lines.push('|-|-|-|-|');
    for (const moduleDiff of chunkGroupDiff.added) {
        lines.push(`|+|${transform(moduleDiff.module)}|${moduleDiff.weight.moduleCount}|${formatDelta(moduleDiff.weight.size)}|`);
    }
    for (const moduleDiff of chunkGroupDiff.removed) {
        lines.push(`|-|${transform(moduleDiff.module)}|${moduleDiff.weight.moduleCount}|${formatDelta(-moduleDiff.weight.size)}|`);
    }
    let count = 0;
    let netDelta = 0;
    for (const moduleDelta of chunkGroupDiff.changed) {
        if (Math.abs(moduleDelta.delta) < threshold) {
            count++;
            netDelta += moduleDelta.delta;
        }
        else {
            lines.push(`|△|${transform(moduleDelta.module)}| |${formatDelta(moduleDelta.delta)}|`);
        }
    }
    if (count) {
        lines.push(`|△|*${count} modules with minor changes*| |${formatDelta(netDelta)}|`);
    }
    lines.push('');
}
function formatDelta(delta) {
    return (delta >= 0 ? '+' : '') + delta.toLocaleString();
}
