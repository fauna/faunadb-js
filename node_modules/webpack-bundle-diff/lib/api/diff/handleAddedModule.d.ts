import { ModuleGraphNode } from '../../types/BundleData';
import { ChunkGroupDiff } from '../../types/DiffResults';
import { EnhancedModuleGraph } from './EnhancedModuleGraph';
export default function handleAddedModule(moduleName: string, baselineGraph: EnhancedModuleGraph, comparisonGraph: EnhancedModuleGraph, comparisonModule: ModuleGraphNode, chunkGroupName: string, chunkGroupDiff: ChunkGroupDiff): void;
