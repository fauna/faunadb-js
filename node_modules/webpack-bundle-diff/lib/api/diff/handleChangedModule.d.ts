import { ModuleGraphNode } from '../../types/BundleData';
import { ChunkGroupDiff } from '../../types/DiffResults';
export default function handleChangedModule(moduleName: string, baselineModule: ModuleGraphNode, comparisonModule: ModuleGraphNode, chunkGroupDiff: ChunkGroupDiff): void;
