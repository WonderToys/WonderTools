import Random from 'random-js';

import Variable from '../../variable/Variable';

const random = Random();

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
export default RandVariable;