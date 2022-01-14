import { ImportWeight } from '../../types/DiffResults';
import { EnhancedModuleGraph } from './EnhancedModuleGraph';
export declare function getAddedWeight(moduleName: string, baseline: EnhancedModuleGraph, comparison: EnhancedModuleGraph, chunkGroupName: string): ImportWeight;
export declare function getRemovedWeight(moduleName: string, baseline: EnhancedModuleGraph, comparison: EnhancedModuleGraph, chunkGroupName: string): ImportWeight;
