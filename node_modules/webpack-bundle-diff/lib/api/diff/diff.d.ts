import { BundleData } from '../../types/BundleData';
import { Stats } from '../../types/Stats';
import { DataOptions } from '../../types/DataOptions';
export declare function diff(baseline: BundleData | Stats, comparison: BundleData | Stats, options?: DataOptions): import("../..").DiffResults;
