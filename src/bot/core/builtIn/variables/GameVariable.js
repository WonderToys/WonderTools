import { getChannelInfo } from '../../../../api/twitch';
import Variable from '../../variable/Variable';

// -----
//  ParamVariable
// -----

class ParamVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$game';
  }

  get description() {
    return 'Get the last played game of the specified user. Defaults to logged in streamer.';
  }

  get usage() {
    return '$game([STREAMER])';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    let channel = request.channel;

    if ( args.length > 0 ) {
      channel = args[0];
    }

    return getChannelInfo(channel)
      .then((channel) => {
        return channel.game || 'N/A';
      });
  }
}

// Exports
export default ParamVariable;