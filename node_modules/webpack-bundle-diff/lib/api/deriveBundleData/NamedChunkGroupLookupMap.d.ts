import { Stats, ChunkId } from '../../types/Stats';
export default class NamedChunkGroupLookupMap {
    private map;
    constructor(stats: Stats);
    getNamedChunkGroups(chunks: ChunkId[]): string[];
}
