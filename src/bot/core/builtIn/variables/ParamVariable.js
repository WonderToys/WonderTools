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