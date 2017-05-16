import Variable from '../../variable/Variable';

// -----
//  UserVariable
// -----

class UserVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$user';
  }

  get description() {
    return 'Get the name of the user who called the command';
  }

  get usage() {
    return '$user';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    return request.viewer.displayName || request.viewer.username;
  }
}

// Exports
export default UserVariable;