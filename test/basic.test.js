"use strict";

require('co-mocha');

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  expect = chai.expect,
  should = chai.should();
  
  
const DATA_DIR = path.join(__dirname, 'data'),
  EXAMPLE1 = path.join(DATA_DIR, 'example1');
  

const docLite = require('../lib');


const test = module.exports = {};


test['default'] = {
  beforeEach: function*() {
    this.json = readFile(EXAMPLE1 + '.noCode.json');
  },
  'string': {
    beforeEach: function*() {
      this.code = readFile(EXAMPLE1 + '.js');
    },
    promise: function*() {
      const result = yield docLite.processString(this.code);
      
      JSON.stringify(result, null, 2).should.eql(this.json);      
    },
    callback: function(done) {
      docLite.processString(this.code, (err, result) => {
        if (err) {
          return done(err);
        }  
        
        try {
          JSON.stringify(result, null, 2).should.eql(this.json);      
          
          done();
        } catch (err) {
          done(err);
        }
      });        
    },
  },
  file: {
    promise: function*() {
      const result = yield docLite.processFile(EXAMPLE1 + '.js');
      
      JSON.stringify(result, null, 2).should.eql(this.json);      
    },
    callback: function(done) {
      docLite.processFile(EXAMPLE1 + '.js', (err, result) => {
        if (err) {
          return done(err);
        }  
        
        try {
          JSON.stringify(result, null, 2).should.eql(this.json);      
          
          done();
        } catch (err) {
          done(err);
        }
      });        
    },
  }
};


test['with code'] = function*() {
  const result = yield docLite.processFile(EXAMPLE1 + '.js', {
    includeCode: true
  });
  
  JSON.stringify(result, null, 2).should.eql(readFile(EXAMPLE1 + '.code.json'));      
}




function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').toString();
}

