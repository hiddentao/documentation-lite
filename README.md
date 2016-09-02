# documentation-lite

[![Build Status](https://secure.travis-ci.org/hiddentao/documentation-lite.png)](http://travis-ci.org/hiddentao/documentation-lite)

Extract JSDoc documentation from ES5/ES6 files into a JSON output structure.

This is a wrapper around the excellent [documentation.js](https://github.com/documentationjs/documentation) 
which simplifies the returned JSON to make it easier to use for further 
processing. 

At present it does not resolve external dependencies, and is designed for 
processing one file at a time.

Features:
* Works with both code strings and files.
* Works with constants, classes, static methods and generator methods.
* Uses Markdown formatting where needed (e.g. for inline code)
* Can optionally attach original source code to each tree node.

## Demo

* Input file: [test/data/example1.js](test/data/example1.js)
* Output file: [test/data/example1.noCode.json](test/data/example1.noCode.json)

## Installation

```shell
npm install documentation-lite
```

## Usage

Import the module:

```js
const docLite = require('documentation-lite');
```

There are two API methods, both of which are asynchronous and return Promises, 
and also accept callbacks in case that's how you'd rather code:

```js
**
 * Extract documentation from given string of code.
 * 
 * @param {String} codeStr String of code to process.
 * @param {Object} [options] Additional options.
 * @param {Boolean} [options.includeCode] If set then each output node will include a `code` key containing the original relevant source code.
 * @param {Function} [cb] Result callback, in case you do not want to use Promises.
 * @return {Promise} resolves to JSON structure.
 */
processString (codeStr, options, cb);

/**
 * Extract documentation from given file.
 * 
 * @param  {String} filePath Absolute path to file.
 * @param {Object} [options] Additional options.
 * @param {Boolean} [options.includeCode] If set then each output node will include a `code` key containing the original relevant source code.
 * @param {Function} [cb] Result callback, in case you do not want to use Promises.
 * @return {Promise} resolves to JSON structure.
 */
processFile (filePath, options, cb);
```

### Using with a Promise

Using `processString()` with a Promise:

```js
const code = `
/**
 * A variable!
 * @type {String}
 */
const DIR = __dirname;
`;

docLite.processString(code)
  .then((json) => {
    console.log(json);
  })
  .catch(console.error);
```

Will output:

```js
{
  "constants": [
    {
      "name": "DIR",
      "tags": {
        "type": [
          {
            "description": null,
            "type": {
              "name": "String"
            }
          }
        ]
      },
      "description": [
        "A variable!"
      ],
      "type": {
        "description": null,
        "type": {
          "name": "String"
        }
      }
    }
  ]
}
```

### Using with a callback

Using `processFile()` with a callback:

```js
docLite.processFile('myfile.js', (err, json) = {
  if (err) {
    return console.error(err);
  }
  
  console.log(json);
});
```

### Attaching code to output JSON

Example input file:

```js
/**
 * Output a message
 * @param {String} msg The message.
 */
exports.print = function(msg) {
  console.log(msg);
}
```

Let's extract the docs:

```js
docLite.processFile('input.js', {
  includeCode: true
})
.then((json) => {
  console.log( JSON.stringify(json, null, 2));
});
```

Will output:

```js
{
  "functions": [
    {
      "name": "print",
      "tags": {...},
      "description": [...],
      "params": [...],
      "returns": [],
      "throws": [],
      "code": [
        "exports.print = function(msg) {",
        "  console.log(msg);",
        "}"
      ]
    }
  ]
}
```

## Contributors

Contributions welcome - see [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - see [LICENSE.md](LICENSE.md)

