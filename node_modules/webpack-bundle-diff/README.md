# webpack-bundle-diff

Webpack-bundle-diff is a tool for understanding changes to your webpack bundles.  Because a single import can cause a whole tree of downstream dependencies to get pulled into a bundle, it is possible for a seemingly innocuous change to have a large effect on your bundle size.  And when some module *does* get unexpectedly included in your bundle, it can be hard to understand specifically what code change caused it.  By comparing the webpack stats from before and after a change, webpack-bundle-diff helps you understand the change's precise impact.

## Getting started

1. Install: `npm install -g webpack-bundle-diff`
2. Produce webpack stats files: `webpack --json > stats.json`
3. Diff: `wbd diff stats1.json stats2.json -o diff.json`
4. Report: `wbd report diff.json -o report.md`

## Named chunk groups

Diff information is only reported for **named chunk groups**.  Be sure to provide a name for every entry point or code split point that you want analyzed.  For example, to configure to entry points named `home` and `about` your webpack config might look like:

```typescript
{
    entry: {
        home: "./home.js",
        about: "./about.js"
    }
}
```

To provide a name for a dynamically imported bundle, include the `webpackChunkName` magic comment:

```typescript
import(/* webpackChunkName: "lodash" */ 'lodash');
```

## Commands

### **wbd data \<stats file\> -o \<output file\>**

Generates a bundle data JSON file that can be passed to `wbd diff`.  Webpack stats files can be huge, with lots of redundant or unnecessary information.  A bundle data file contains just the information needed for webpack-bundle-diff to do its work at a tiny fraction of the size.  While you can work with webpack stats files directly, you may find it preferable to store bundle data files for the reduced read/write time and space requirements.

### **wbd diff \<baseline stats file\> \<comparison stats file\> -o \<output file\>**

Generates a JSON file containing detailed information about the diff.  The provided stats files can be the raw webpack stats or bundle data files produced with `wbd data`.

### **wbd report \<diff file\> -o \<output file\>**

Produces a human-readable summary of the provided diff in markdown format.

## API

Webpack-bundle-diff can also be run programmatically via the API:

```typescript
import { diff, generateReport } from 'webpack-bundle-diff';

let diff = diff(stats1, stats2);
let report = generateReport(diff);
```

## Understanding the bundle diff report

In order to make sense of the bundle diff, you need to understand webpack's concept of a *chunk group*.  Every entry point or code split point defines a chunk group, which is effectively the set of JavaScript that needs to be evaluated when that code point is loaded.  (Chunk groups can be *named*, either by using named entry points or supplying a magic comment inside a dynamic import.)  A chunk group may consist of multiple JS files, so the "size" of a chunk group is considered the sum of its JS file sizes.  (Some JS files may be shared between chunk groups, so it is not always necessary to load the full amount when loading a chunk group.)

The diff report has an entry for each named chunk group, excluding those that have no changes.  The size delta for that chunk group is reported in the heading, followed by a table with details about what modules changes in that chunk group.

> **main (+1,284 bytes)**
>
> || Module | Count | Size |
> |-|-|-|-|
> |+|./A.js|6|+2,341|
> |+|./B.js|8|+3,229|
> |-|./C.js|3|-872|
> |△|./D.js||+437|
> |△|*5 modules with minor changes*| |+36|

* The first column of the table indicates whether modules were added (+), removed (-), or changed (△).  Modules with only minor changes (possibly due to internal webpack heuristics) are aggregated together in the last row of the table.
* One module may cause a whole subgraph of dependencies to get included in the bundle.  The *Count* indicates how many modules were included due to this module.
* *Size* is the total change in size due to this module and any dependencies it brings in.

Note that the size delta for the chunk group as a whole does not correspond directly to the sizes reported in the table.  The delta reported for the chunk group is based on the final size on disk, possibly including minification.  (Individual module sizes are pre-minification.)  Additionally, the numbers in the table may account for overlapping modules.  For example, in the example above A.js brings in 6 modules and B.js brings in 8 modules; but some of those modules may be shared between them and thus counted twice.
