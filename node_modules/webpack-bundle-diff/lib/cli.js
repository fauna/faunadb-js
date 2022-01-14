"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const fs = require("fs");
const readJson_1 = require("./util/readJson");
const index_1 = require("./index");
// Read the package version from package.json
const packageVersion = require('../package').version;
// Set up the available commands
const program = commander.version(packageVersion);
program
    .command('data <stats>')
    .description('derive bundle data from stats')
    .option('-o, --outFile <string>', 'output file')
    .action((statsPath, options) => {
    console.log('Deriving bundle data from stats...');
    readJson_1.default(statsPath).then((stats) => {
        const bundleData = index_1.deriveBundleData(stats);
        fs.writeFileSync(options.outFile, JSON.stringify(bundleData, null, 2));
    });
});
program
    .command('diff <baseline> <comparison>')
    .description('diff bundles')
    .option('-o, --outFile <string>', 'output file')
    .action((baselinePath, comparisonPath, options) => {
    console.log('Diffing bundles...');
    Promise.all([readJson_1.default(baselinePath), readJson_1.default(comparisonPath)]).then(data => {
        let result = index_1.diff(data[0], data[1]);
        fs.writeFileSync(options.outFile, JSON.stringify(result, null, 2));
    });
});
program
    .command('report <diff>')
    .description('generate a markdown report from a diff')
    .option('-o, --outFile <string>', 'output file')
    .action((diffPath, options) => {
    console.log('Generating report...');
    readJson_1.default(diffPath).then((diff) => {
        const markdown = index_1.generateReport(diff);
        fs.writeFileSync(options.outFile, markdown);
    });
});
// Execute the command line
program.parse(process.argv);
