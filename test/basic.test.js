"use strict";

require('co-mocha');

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();
  
  
const DATA_DIR = path.join(__dirname, 'data'),
  EXAMPLE1 = path.join(DATA_DIR, 'example1.js');
  

const docLite = require('../lib');


const test = module.exports = {};


test['example1'] = {
  'code string - promise': function*() {
    const codeStr = fs.readFileSync(EXAMPLE1).toString();
    
    const result = yield docLite.processString(codeStr);
    
    fs.writeFileSync('./test.json', JSON.stringify(result, null, 2));
    
    console.log(result);
  }
};
