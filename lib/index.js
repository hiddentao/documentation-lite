"use strict";
/**
 * @file Main entry point.
 */

const debug = require('debug')('documentation-lite'),
  Q = require('bluebird'),
  documentation = require('documentation'),
  tmp = require('tmp'),
  fs = require('fs');
  
const simplifyJson = require('./simplify');



/**
 * Extract documentation from given string of code.
 * 
 * @param {String} codeStr String of code to process.
 * @param {Object} [options] Additional options.
 * @param {Boolean} [options.includeCode] If set then each output node will include a `code` key containing the original relevant source code.
 * @param {Function} [cb] Result callback, in case you don't want to use Promises.
 * @return {Promise} resolves to JSON structure.
 */
exports.processString = function(codeStr, options, cb) {
  debug('Process code string');
  
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }
  
  return new Q(function(resolve, reject) {
    debug('Creating temporary file name');
    
    tmp.tmpName(function _tempNameGenerated(err, filePath) {
      if (err) {
        return reject(err);
      }
      
      filePath += '.js';
      
      debug(`Writing code to temporary file: ${filePath}`);
      
      fs.writeFileSync(filePath, codeStr, {
        encoding: 'utf8'
      });
      
      let errThrown = null;
      
      exports.processFile(filePath, options)
      .then(resolve)
      .catch(reject)
      .finally(function afterEverything() {
        debug(`Delete temporary file: ${filePath}`);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting ${filePath}`);
          }
        });
      });
    });
  })
  .asCallback(cb);  
};


/**
 * Extract documentation from given file.
 * 
 * @param  {String} filePath Absolute path to file.
 * @param {Object} [options] Additional options.
 * @param {Boolean} [options.includeCode] If set then each output node will include a `code` key containing the original relevant source code.
 * @param {Function} [cb] Result callback, in case you don't want to use Promises.
 * @return {Promise} resolves to JSON structure.
 */
exports.processFile = function(filePath, options, cb) {
  debug(`Process file ${filePath}`);

  if (typeof options === 'function') {
    cb = options;
    options = null;
  }
  
  options = options || {};

  return new Q(function(resolve, reject) {
    debug(`Extract documentation`);
    
    const opts = {
      polyglot: false,
      shallow: true,
    };
    
    debug(`Build options: ${JSON.stringify(opts)}`);

    documentation.build(filePath, opts, function afterBuild(err, result) {
      if (err) {
        return reject(err);
      }
      
      // read in the code
      const code = fs.readFileSync(filePath, 'utf8').toString();
      
      let resolverOptions = {};
      
      resolve(simplifyJson(result, code, options));
    });
  })
  .asCallback(cb);
};



