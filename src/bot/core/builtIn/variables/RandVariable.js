"use strict";

const random = require('random-js')();

const Variable = require('../../core/variable/Variable');

// -----
//  RandVariable
// -----

class RandVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$rand';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const min = parseInt(args[0]);
    const max = parseInt(args[1]);

    if ( isNaN(min) || isNaN(max) ) {
      return null;
    }

    return random.integer(min, max);
  }
}

// Exports
module.exports = RandVariable;