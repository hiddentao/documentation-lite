"use strict";

require('co-mocha');

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();
  
  
const DATA_DIR = path.join(__dirname, 'data'),
  EXAMPLE = path.join(DATA_DIR, 'example2');
  

const docLite = require('../lib');


const test = module.exports = {};


test['default'] = function*() {
  const result = yield docLite.processString(`
  /**
   * Come again?
   */
  class A {
  }  
  `);
  
  result.should.eql({
    "classes": [
      {
        "name": "A",
        "tags": {},
        "description": [
          "Come again?"
        ],
        "parents": [],
        "instance": null,
        "static": null
      }
    ]
  });      
};
