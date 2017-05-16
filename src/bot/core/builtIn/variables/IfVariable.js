import Variable from '../../variable/Variable';

// -----
//  IfVariable
// -----

class IfVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$if';
  }

  get description() {
    return 'Do some simple logic tests';
  }

  get usage() {
    return '$if(=, TRUE, FALSE, "True!", "False!")';
  }

  // -----
  //  Private
  // -----

  _parseArguments(args) {
    let comparator = '=';
    let leftSide = null;
    let rightSide = null;
    let trueResult = true;
    let falseResult = false;

    if ( args.length === 2 ) {
      leftSide = args[0];
      trueResult = args[1];
    }

    if ( args.length === 3 ) {
      leftSide = args[0];
      trueResult = args[1];
      falseResult = args[2];
    }

    if ( args.length === 4 ) {
      leftSide = args[0];
      rightSide = args[1];
      trueResult = args[2];
      falseResult = args[3];
    }

    if ( args.length === 5 ) {
      comparator = args[0];
      leftSide = args[1];
      rightSide = args[2];
      trueResult = args[3];
      falseResult = args[4];
    }

    return { comparator, leftSide, rightSide, trueResult, falseResult };
  }

  _compare(comparator, leftSide, rightSide) {
    switch ( comparator ) {
      case '=': {
        if ( rightSide == null ) {
          return leftSide != null && leftSide != '' && leftSide != false;
        }
        else {
          return leftSide == rightSide;
        }
      }

      case '!=': {
        if ( rightSide == null ) {
          return leftSide == null || leftSide == '' || leftSide == false;
        }
        else {
          return leftSide != rightSide;
        }
      }

      case '>': {
        return leftSide > rightSide;
      }

      case '<': {
        return leftSide < rightSide;
      }

      case '>=': {
        return leftSide >= rightSide;
      }
      
      case '<=': {
        return leftSide <= rightSide;
      }
    };
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    if ( args == null || args.length < 2 ) {
      return null;
    }

    args = this._parseArguments(args);
    const result = this._compare(args.comparator, args.leftSide, args.rightSide);

    if ( result === true ) {
      return args.trueResult;
    }
    else if ( result !== true && args.falseResult != null ) {
      return args.falseResult;
    }

    return '';
  }
}

// Exports
export default IfVariable;