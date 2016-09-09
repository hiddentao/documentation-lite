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


test['no code'] = function*() {
  const result = yield docLite.processFile(EXAMPLE + '.js');
  
  JSON.stringify(result, null, 2).should.eql(readFile(EXAMPLE + '.noCode.json'));      
};


test['with code'] = function*() {
  const result = yield docLite.processFile(EXAMPLE + '.js', {
    includeCode: true
  });
  
  JSON.stringify(result, null, 2).should.eql(readFile(EXAMPLE + '.code.json'));      
};




function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').toString();
}

