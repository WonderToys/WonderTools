import Variable from '../../variable/Variable';

// -----
//  FollowDateVariable
// -----

class FollowDateVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$followdate';
  }

  get description() {
    return 'Get the followed date for the user calling the command';
  }

  get usage() {
    return '$followdate';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const viewer = request.viewer;
    if ( viewer.followDate == null ) {
      return '';
    }

    return viewer.followDate;
  }
}

// Exports
export default FollowDateVariable;