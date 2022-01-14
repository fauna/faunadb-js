import { Stats } from '../../types/Stats';
export default class ModuleIdToNameMap {
    private map;
    constructor(stats: Stats);
    get(id: string | number): string;
}
