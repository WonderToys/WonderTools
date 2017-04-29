import moment from 'moment';

import { Command } from '../../command/Command';
import viewerStore from '../../viewer/viewerStore';

// -----
//  FollowAgeCommand
// -----

class FollowAgeCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!followage';
  }

  get name() {
    return 'FollowAge';
  }

  get description() {
    return 'How long have you been following for?';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const viewer = request.viewer;

    viewerStore._updateFollowing(viewer)
      .then((viewer) => {
        if ( viewer.isFollower === false ) {
          reply("Uhh $user, you're not following. You're bad and should feel bad.");
          return;
        }

        const date = moment(viewer.followDate);
        reply(`$user, you started following on ${ date.format('dddd, MMMM Do YYYY') } (${ date.fromNow() })`);
      });
  }
};

// Register
export default FollowAgeCommand;