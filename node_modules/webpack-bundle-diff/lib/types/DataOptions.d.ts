export interface DataOptions {
    /**
     * Optional filter to apply to chunk group assets.  If provided, each asset name is passed to
     * the filter and only those for which `true` is returned are counted towards the chunk group
     * size.
     */
    assetFilter?: AssetFilter;
}
export interface AssetFilter {
    (name: string): boolean;
}
