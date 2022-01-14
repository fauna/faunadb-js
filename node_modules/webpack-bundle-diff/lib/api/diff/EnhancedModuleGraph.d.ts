import { ModuleGraph, ModuleGraphNode } from '../../types/BundleData';
export declare class EnhancedModuleGraph {
    private graph;
    constructor(moduleGraph: ModuleGraph);
    getModule(moduleName: string): EnhancedModuleGraphNode;
    hasModule(moduleName: string, chunkGroupName?: string): boolean;
    getAllModuleNames(): IterableIterator<string>;
}
interface EnhancedModuleGraphNode extends ModuleGraphNode {
    children: string[];
}
export {};
