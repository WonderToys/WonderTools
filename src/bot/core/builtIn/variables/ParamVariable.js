import Variable from '../../variable/Variable';

// -----
//  ParamVariable
// -----

class ParamVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return /\$\d+/;
  }

  get displayName() {
    return '$N';
  }

  get description() {
    return 'Get the numbered parameter passed to the command';
  }

  get usage() {
    return '$1, $2, $3, etc ...';
  }

  // -----
  //  Public
  // -----

  resolve(args, request, matchedParam) {
    const params = request.params;
    let index = parseInt(matchedParam.replace('$', ''));

    if ( !isNaN(index) ) {
      index--;
      if ( index >= 0 && index <= params.length - 1 ) {
        return params[index];
      }
    }

    return null;
  }
}

// Exports
export default ParamVariable;