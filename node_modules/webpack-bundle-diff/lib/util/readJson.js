"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const es = require("event-stream");
const JSONStream = require('JSONStream');
// Webpack's stats.json file can be huge, too large to read in as a single string.  The following
// uses JSONStream to stream the file and parse it on the fly.
function readJson(path) {
    return new Promise((resolve, reject) => {
        let parsedObject = {};
        let stream = fs
            .createReadStream(path, { encoding: 'utf8' })
            .pipe(JSONStream.parse('$*'))
            .pipe(es.mapSync((data) => {
            parsedObject[data.key] = data.value;
        }));
        stream.on('close', () => {
            resolve(parsedObject);
        });
        stream.on('error', reject);
    });
}
exports.default = readJson;
