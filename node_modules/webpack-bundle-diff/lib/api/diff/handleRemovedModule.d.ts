import { ModuleGraphNode } from '../../types/BundleData';
import { ChunkGroupDiff } from '../../types/DiffResults';
import { EnhancedModuleGraph } from './EnhancedModuleGraph';
export default function handleRemovedModule(moduleName: string, baselineGraph: EnhancedModuleGraph, comparisonGraph: EnhancedModuleGraph, baselineModule: ModuleGraphNode, chunkGroupName: string, chunkGroupDiff: ChunkGroupDiff): void;
