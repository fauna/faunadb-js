export interface DiffResults {
    [chunkGroupName: string]: ChunkGroupDiff;
}
export interface ChunkGroupDiff {
    delta: number;
    added: ModuleDiff[];
    removed: ModuleDiff[];
    changed: ModuleDelta[];
}
export interface ModuleDiff {
    module: string;
    parents: string[];
    weight: ImportWeight;
}
export interface ImportWeight {
    moduleCount: number;
    size: number;
    modules: string[];
}
export interface ModuleDelta {
    module: string;
    delta: number;
}
