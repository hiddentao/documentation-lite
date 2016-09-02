"use strict";
/**
 * @file Simplification logic.
 */

const debug = require('debug')('documentation-lite-simplify'),
  _ = require('lodash');



/**
 * JSON simplification transfomer.
 */
class Transformer {
  /**
   * @param  {Object} json JSON input.
   * @param {String} original code with comments.
   */
  constructor (json, codeStr) {
    this.json = json;
    this.code = codeStr.split("\n");
  }
  
  
  /**
   * Build Simplified JSON.
   * 
   * @return {Object} simplified JSON output.
   */
  run() {
    const root = {};
    
    for (let section of this.json) {
      switch (section.kind) {
        case 'file':
          root.fileTag = this.simplifyFileTag(section);
          break;
        case 'constant':
          root.constants = root.constants || [];
          root.constants.push(this.simplifyConstant(section));
          break;
        case 'function':
          root.functions = root.functions || [];
          root.functions.push(this.simplifyFunction(section));
          break;
        case 'class':
          root.classes = root.classes || [];
          root.classes.push(this.simplifyClass(section));
          break;
        default:
          debug(`Skipping unsupported comment block: ${section.kind}`);
      }
    }
    
    return root;
  }



  /**
   * Simplify `file` tag.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyFileTag (input) {
    input = input || {};
    
    return {
      description: this.simplifyDescription(input.description),
    };
  }



  /**
   * Simplify a class.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyClass (input) {
    input = input || {};
    
    let ret = {
      name: input.name,
      tags: this.simplifyTags(input.tags),
      code: this.getLocationCode(input.context),
      description: this.simplifyDescription(input.description),
      parents: this.simplifyInherited(input.augments),
      members: this.simplifyClassMembers(input.members),
    };
    
    if (ret.members.constructor) {
      ret.constructor = ret.members.constructor;
    }
    
    return this.decorateOutput(ret);
  }
  

  /**
   * Simplify class members.
   * @param  {Object} input JSON
   * @return {Object}
   */
  simplifyClassMembers (input) {
    input = input || {};
    
    let ret = {};
    
    if (input.instance) {
      let methods = ret.methods = {},
        properties = ret.instanceProperties = {};
      
      input.instance.forEach((item) => {
        if ('constructor' === item.name) {
          ret.constructor = this.simplifyFunction(item);
          
          return;
        }
        
        if ('function' === item.kind) {
          methods[item.name] = this.simplifyFunction(item);
        } else if ('member' === item.kind) {
          properties[item.name] = properties[item.name] || {
            name: item.name,
          };
          
          let simplified = this.simplifyFunction(item);
          
          if (simplified.params.length) {
            properties[item.name].setter = simplified;
          } else {
            properties[item.name].getter = simplified;
          }
        }
      });
    }
    
    if (input.static) {
      let staticMethods = ret.staticMethods = {};
      
      input.static.forEach((item) => {
        staticMethods[item.name] = this.simplifyFunction(item);
      });
    }
    
    return ret;
  }
  
  
  
  
  /**
   * Simplify a function.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyFunction (input) {
    input = input || {};
    
    let ret = {
      name: input.name,
      tags: this.simplifyTags(input.tags),
      description: this.simplifyDescription(input.description),
      params: this.simplifyParams(input.params),
      returns: this.simplifyReturns(input.returns),
      throws: this.simplifyThrows(input.throws),
      code: this.getLocationCode(input.context),
    };
    
    return this.decorateOutput(ret);
  }




  /**
   * Simplify a constant.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyConstant (input) {
    input = input || {};
    
    let ret = {
      name: input.name,
      tags: this.simplifyTags(input.tags),
      description: this.simplifyDescription(input.description),
      code: this.getLocationCode(input.context),
    };
    
    if (ret.tags.type) {
      ret.type = ret.tags.type[0];
    }
    
    return this.decorateOutput(ret);
  }


  /**
   * Simplify class parent inheritance info.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyInherited (input) {
    input = input || [];
    
    return input.map((item) => {
      return {
        name: item.name,
      };
    });
  }

  /**
   * Simplify tags list.
   * @param  {Object|Array} input JSON
   * @return {Object} tag type => array of occurrences
   */
  simplifyTags(input) {
    input = input || [];
    
    let ret = {};
    
    input.forEach((item) => {
      let tagName = item.title;
      
      // avoid clash with built-in constructor object
      if (tagName === 'constructor') {
        tagName = '_constructor';
      }
      
      ret[tagName] = ret[tagName] || [];
      
      let newItem = {
        description: item.description,
      };
      
      if (item.type) {
        newItem.type = this.simplifyType(item.type);
      }
      
      switch (tagName) {
        case 'param':
          newItem.name = item.name;
          break;
      }
      
      ret[tagName].push(newItem);
    });
    
    return ret;
  }


  /**
   * Simplify params list.
   * @param  {Array} input JSON
   * @return {Array}
   */
  simplifyParams(input) {
    input = input || [];
    
    return input.map((item) => {
      return {
        name: item.name,
        description: this.simplifyDescription(item.description),
        type: this.simplifyType(item.type),
      };
    });
  }


  /**
   * Simplify returns list.
   * @param  {Array} input JSON
   * @return {Array}
   */
  simplifyReturns(input) {
    input = input || [];
    
    return input.map((item) => {
      return {
        description: this.simplifyDescription(item.description),
        type: this.simplifyType(item.type),
      };
    });
  }



  /**
   * Simplify throws list.
   * @param  {Array} input JSON
   * @return {Array}
   */
  simplifyThrows(input) {
    return this.simplifyReturns(input);
  }



  /**
   * Simplify a type object.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
   simplifyType(input) {
    input = input || {};
    
    let ret = {};
    
    if ('OptionalType' === input.type) {
      ret.optional = true;
    }
    
    if ('NameExpression' === _.get(input, 'expression.type', '')) {
      ret.name = input.expression.name;
    } else if ('NameExpression' === input.type) {
      ret.name = input.name;    
    }
    
    return ret;
  }


  /**
   * Simplify a description consisting of 1+ paragraphs.
   * @param  {Object|Array} input JSON
   * @return {Array}
   */
  simplifyDescription(input) {
    input = input || {};
    
    return this.simplifyParagraphs(input.children);
  }




  /**
   * Simplify text paragraphs.
   * @param  {Object|Array} input JSON
   * @return {Array}
   */
  simplifyParagraphs(input) {
    input = input || [];
    
    return input.map((item) => this.simplifyText(item.children));
  }


  /**
   * Simplify a paragraph of text.
   * @param  {Object|Array} input JSON
   * @return {String}
   */
  simplifyText(input) {
    input = input || [];
    
    return input.reduce((memo, item) => {
      switch (item.type) {
        case 'text':
          return memo + item.value;
          break;
        case 'inlineCode':
          return memo + '`' + item.value + '`';
      }
    }, '');
  }




  /**
   * Decorate given output JSON with additional keys as appropriate.
   * @param  {Object} output JSON
   * @return {Object}
   */
  decorateOutput (output) {
    output = output || {};
    
    if (_.get(output, 'tags.global')) {
      output.global = output.tags.global[0];
    }

    if (_.get(output, 'tags.example')) {
      output.examples = output.tags.examples;
    }

    return output;
  }

  /**
   * Get source for given location context.
   *
   * @param {Object} context Location context.
   * @return {String} Code.
   */
  getLocationCode (context) {
    const startLine = _.get(context, 'loc.start.line', -1),
      startCol = _.get(context, 'loc.start.column', 0);
    
    const endLine = _.get(context, 'loc.end.line', -1),
      endCol = _.get(context, 'loc.end.column', 0);
      
    if (0 > startLine || 0 > endLine || endLine < startLine) {
      debug('Invalid location context');
      
      return null;
    }
    
    let str = this.code.slice(startLine-1, endLine-1).concat(
      this.code[endLine-1].substr(0, endCol)
    );
    
    return str.length ? str : null;
  }

  
}



module.exports = function(json, codeStr) {
  return new Transformer(json, codeStr).run();
}

