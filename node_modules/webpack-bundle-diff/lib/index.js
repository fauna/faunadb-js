"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = exports.diff = exports.deriveBundleData = void 0;
var deriveBundleData_1 = require("./api/deriveBundleData/deriveBundleData");
Object.defineProperty(exports, "deriveBundleData", { enumerable: true, get: function () { return deriveBundleData_1.deriveBundleData; } });
var diff_1 = require("./api/diff/diff");
Object.defineProperty(exports, "diff", { enumerable: true, get: function () { return diff_1.diff; } });
var generateReport_1 = require("./api/generateReport/generateReport");
Object.defineProperty(exports, "generateReport", { enumerable: true, get: function () { return generateReport_1.generateReport; } });
__exportStar(require("./types/Stats"), exports);
__exportStar(require("./types/BundleData"), exports);
__exportStar(require("./types/DiffResults"), exports);
__exportStar(require("./types/ReportOptions"), exports);
