"use strict";

const debug = require('debug')('documentation-lite'),
  documentation = require('documentation'),
  tmp = require('tmp'),
  fs = require('fs');



/**
 * Extract documentation from given string of code.
 * 
 * @param  {String} codeStr String of code to process.
 * @return {Promise} resolves to JSON structure.
 */
exports.processString = function(codeStr) {
  debug('Process code string');
  
  return new Promise(function(resolve, reject) {
    debug('Creating temporary file name');
    
    tmp.tmpName(function _tempNameGenerated(err, filePath) {
      if (err) {
        return reject(err);
      }
      
      debug('Writing code to temporary file');
      
      fs.writeFileSync(filePath, codeStr, {
        encoding: 'utf8'
      });
      
      let errThrown = nul;
      
      debug('Extract documentation from file');
      
      exports.processFile(filePath)
      .then(resolve)
      .catch(reject)
      .finally(function afterEverything() {
        debug('Delete temporary file');

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting ${filePath}`);
          }
        });
      });
    });
  });
};


/**
 * Extract documentation from given file.
 * 
 * @param  {String} filePath Absolute path to file.
 * @return {Promise} resolves to JSON structure.
 */
exports.processFile = function(filePath) {
  debug(`Process file ${filePath}`);

  return new Promise(function(resolve, reject) {
    documentation.build([filePath], function afterBuild(err, result) {
      if (err) {
        return reject(err);
      }
      
      console.log(result);
    });
  });
};








