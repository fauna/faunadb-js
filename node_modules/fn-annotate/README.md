# fn-annotate

[![NPM Version](https://img.shields.io/npm/v/fn-annotate.svg)](https://www.npmjs.com/package/fn-annotate)
[![Build Status](https://img.shields.io/travis/aantthony/annotate/master.svg)](https://travis-ci.org/aantthony/annotate)
[![NPM Downloads](https://img.shields.io/npm/dm/fn-annotate.svg)](https://www.npmjs.com/package/fn-annotate)
[![License](https://img.shields.io/npm/l/fn-annotate.svg)](https://www.npmjs.com/package/fn-annotate)

Get the argument names of a JavaScript function.

## Install

`npm install --save fn-annotate`

## Usage

```js
var annotate = require('fn-annotate');

function myFunction (user, document, db) {
  // do some stuff.
}

var argumentNames = annotate(myFunction);

// [ 'user', 'document', 'db' ]
console.log(argumentNames);

// [ 'x' ]
console.log(annotate(x => x));

// [ 'param' ]
console.log(annotate(function * (param) {}));
```
