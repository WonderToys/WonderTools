import Variable from '../../variable/Variable';

// -----
//  TargetVariable
// -----

class TargetVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$target';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const username = request.viewer.displayName || request.viewer.username;

    return request.params[0] || username;
  }
}

// Exports
export default TargetVariable;