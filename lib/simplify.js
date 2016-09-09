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
   * @param {Object} [options] Additional options.
   * @param {Boolean} [options.includeCode] If set then each output node will include a `code` key containing the original relevant source code.
   */
  constructor (json, codeStr, options) {
    this.json = json;
    this.code = codeStr.split("\n");
    this.options = options || {};
  }
  
  
  /**
   * Build Simplified JSON.
   * 
   * @return {Object} simplified JSON output.
   */
  run() {
    return this.simplifyStaticMembers(this.json);
  }


  
  /**
   * Simplify static members
   * @param  {Array} input JSON
   * @return {Object}
   */  
  simplifyStaticMembers (json) {
    const root = {};
    
    for (let section of json) {
      switch (section.kind) {
        case 'file':
          root.file = this.simplifyFileTag(section);
          break;
        case 'constant':
          root.constants = root.constants || [];
          root.constants.push(this.simplifyVariable(section));
          break;
        case 'function':
          root.methods = root.methods || [];
          root.methods.push(this.simplifyFunction(section));
          break;
        case 'class':
          root.classes = root.classes || [];
          root.classes.push(this.simplifyClass(section));
          break;
        default:
          root.variables = root.variables || [];
          root.variables.push(this.simplifyVariable(section));
          break;
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
      description: this.simplifyDescription(input.description),
      parents: this.simplifyInherited(input.augments),
      instance: (!_.isEmpty(input.members.instance)) 
        ? this.simplifyInstanceMembers(input.members.instance)
        : null,
      static: (!_.isEmpty(input.members.static))
        ? this.simplifyStaticMembers(input.members.static)
        : null,
    };
    
    if (ret.instance.constructor) {
      ret.constructor = ret.instance.constructor;
    }
    
    return this.decorateOutput(input, ret);
  }
  

  /**
   * Simplify instance members of a class or some other object.
   * @param  {Object} input JSON
   * @return {Object}
   */
  simplifyInstanceMembers (input) {
    input = input || {};
    
    let ret = {};
    
    let methods = {},
      properties = {};
    
    input.forEach((item) => {
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
    
    if (!_.isEmpty(methods)) {
      ret.methods = methods;
    }
    
    if (!_.isEmpty(properties)) {
      ret.properties = properties;
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
    };
    
    return this.decorateOutput(input, ret);
  }




  /**
   * Simplify a variable.
   * @param  {Object|Array} input JSON
   * @return {Object}
   */
  simplifyVariable (input) {
    input = input || {};
    
    let ret = {
      name: input.name,
      tags: this.simplifyTags(input.tags),
      description: this.simplifyDescription(input.description),
      static: (!_.isEmpty(input.members.static))
        ? this.simplifyStaticMembers(input.members.static)
        : undefined,
    };
    
    if (ret.tags.type) {
      ret.type = ret.tags.type[0];
    }
    
    return this.decorateOutput(input, ret);
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
   * Decorate given output JSON with additional data as appropriate.
   * 
   * @param  {Object} input original input JSON
   * @param  {Object} output JSON
   * @return {Object}
   */
  decorateOutput (input, output) {
    output = output || {};
    
    if (_.get(output, 'tags.global')) {
      output.global = output.tags.global[0];
    }

    if (_.get(output, 'tags.example')) {
      output.examples = output.tags.examples;
    }

    if (this.options.includeCode) {
      output.code = this.getLocationCode(input.context);
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



module.exports = function(json, codeStr, options) {
  return new Transformer(json, codeStr, options).run();
}


