# documentation-lite

[![Build Status](https://secure.travis-ci.org/hiddentao/documentation-lite.png)](http://travis-ci.org/hiddentao/documentation-lite) 
[![NPM module](https://badge.fury.io/js/documentation-lite.png)](https://badge.fury.io/js/documentation-lite)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)

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

## Example

```js
/**
 * Aaah, a Jedi weapon!
 *
 * Use this wisely, or not, it's upto you really.
 */
class LightSabre extends Weapon {
  /**
   * Destroy all possibilities of this weapon.
   */
  static destroyAll () {
    console.log('No more lightsabres allowed? Yikes');
  }
  
  /**
   * This is the constructor.
   *
   * Just in case you don't get that let me add the `constructor` tag too!
   * @constructor
   */
  constructor () {
    super('Will you be my friend?');
    
    this.dukeNukemQuote = 'Come get some';
  }
  
  /**
   * Strike an opponent.
   *
   * Maul them down, completely.
   * 
   * @return {Object} will have `success: true` set.
   */
  strike (opponent) {
    console.log(this.dukeNukemQuote);
    
    this._putLightSabreThroughHeart(opponent);
    
    return {
      success: true
    };
  }
  
  /**
   * Strike an opponent asynchronously.
   *
   * @see strike
   */
  * strikeAsync (opponent) {
    return this.strike(opponent);
  }
  
  /**
   * @override
   * @see Weapon#getType
   */
  get a () {
    return 'light sabre';
  }
}
```

Will output:

```js
{
  "classes": [
    {
      "name": "LightSabre",
      "tags": {},
      "description": [
        "Aaah, a Jedi weapon!",
        "Use this wisely, or not, it's upto you really."
      ],
      "parents": [
        {
          "name": "Weapon"
        }
      ],
      "instance": {
        "constructor": {
          "name": "constructor",
          "tags": {
            "_constructor": [
              {
                "description": null
              }
            ]
          },
          "description": [
            "This is the constructor.",
            "Just in case you don't get that let me add the `constructor` tag too!"
          ],
          "params": [],
          "returns": [],
          "throws": []
        },
        "methods": {
          "strike": {
            "name": "strike",
            "tags": {
              "return": [
                {
                  "description": "will have `success: true` set.",
                  "type": {
                    "name": "Object"
                  }
                }
              ]
            },
            "description": [
              "Strike an opponent.",
              "Maul them down, completely."
            ],
            "params": [
              {
                "name": "opponent",
                "description": [],
                "type": {}
              }
            ],
            "returns": [
              {
                "description": [
                  "will have `success: true` set."
                ],
                "type": {
                  "name": "Object"
                }
              }
            ],
            "throws": []
          },
          "strikeAsync": {
            "name": "strikeAsync",
            "tags": {
              "see": [
                {
                  "description": "strike"
                }
              ]
            },
            "description": [
              "Strike an opponent asynchronously."
            ],
            "params": [
              {
                "name": "opponent",
                "description": [],
                "type": {}
              }
            ],
            "returns": [],
            "throws": []
          }
        },
        "properties": {
          "a": {
            "name": "a",
            "getter": {
              "name": "a",
              "tags": {
                "override": [
                  {
                    "description": null
                  }
                ],
                "see": [
                  {
                    "description": "Weapon#getType"
                  }
                ]
              },
              "description": [],
              "params": [],
              "returns": [],
              "throws": []
            }
          }
        }
      },
      "static": {
        "methods": [
          {
            "name": "destroyAll",
            "tags": {},
            "description": [
              "Destroy all possibilities of this weapon."
            ],
            "params": [],
            "returns": [],
            "throws": []
          }
        ]
      },
      "constructor": {
        "name": "constructor",
        "tags": {
          "_constructor": [
            {
              "description": null
            }
          ]
        },
        "description": [
          "This is the constructor.",
          "Just in case you don't get that let me add the `constructor` tag too!"
        ],
        "params": [],
        "returns": [],
        "throws": []
      }
    }
  ]
}
```

**For more examples see the [test/data](test/data) folder.**

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
  "methods": [
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

