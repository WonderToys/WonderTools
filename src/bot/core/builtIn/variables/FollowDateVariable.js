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