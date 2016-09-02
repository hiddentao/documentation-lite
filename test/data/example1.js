"use strict";

/**
 * @file  This is a file, duh.
 *
 * This file has a tonne of cool stuff inside it. I don't even know what to do 
 * with all of this cool stuff.
 *
 * Here is another paragraph so that I can test multiple paragraphs.
 */

const fs = require('fs'),
  path = require('path');
  
/**
 * Path to test folder.
 * @type {String}
 */
const TESTDIR = path.join(__dirname, '..');

/**
 * My name, of course. And it's global!
 * @type {String}
 * @global App.myvar
 */
const MYNAME = 'Ram';


/**
 * Check that name matches.
 *
 * Let's be honest, this function makes no sense whatsoever. Why did I even 
 * write this?
 *
 * Anyway, I should probably add an example...
 *
 * @example
 * const e = require('example1');
 *
 * // make the call and pray and hope that it works out!
 * e.ensureNameMatches('jack');  
 *
 * @example
 * // ensure it doesn't throw
 * console.log( e.ensureNameMatches('jack', true) );  
 * 
 * @param {String} name the name to check against
 * @param {Boolean} [dontThrow] if set then will return 0 for a mismatch, otherwise will throw.
 * @return {Number} 42 if it matches, 0 otherwise.
 * @throws {Error} if `dontThrow` is not set and `name` doesn't match.
 */
exports.ensureNameMatches = function(name, dontThrow) {
  if (name !== MYNAME) {
    if (dontThrow) {
      return 0;
    } else {
      throw new Error('Bad name, bad name!');
    }
  } else {
    return 42;  // the answer to everything
  }
};


/**
 * A weapon.
 *
 * It does what it says on the tin my young apprentice.
 */
class Weapon {
  /**
   * Build a new instance of this object.
   *
   * (Hehe...or so you think!)
   *
   * @param {String|Number} msg The message to output.
   *
   * @throws {Error} when I want, which will be always.
   */
  constructor (msg) {
    throw new Error(`I am throwing your message back at ya: ${msg} `);
  } 
  
  /**
   * Get type of this weapon.
   * @return {String}
   */
  get a () {
    return this._type || 'unknown';
  }

  /**
   * Set type of this weapon.
   * @param {String} val The value to set.
   */
  set a (val) {
    this._type = val;
  }
}


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


/**
 * Open the door.
 *
 * The door is super-heavy and takes time to open, so we need this to 
 * be asynchronous. 好不好？
 *
 * @return {Promise}
 */
exports.openSesame = function*() {
  return new Promise((resolve, reject) => {
    resolve(1234);
  });
}


