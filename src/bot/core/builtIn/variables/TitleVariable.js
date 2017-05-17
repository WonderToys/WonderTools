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
    return '$title';
  }

  get description() {
    return 'Get the title of the specified stream/channel. Defaults to logged in streamer.';
  }

  get usage() {
    return '$title([STREAMER])';
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
        return channel.status || 'N/A';
      });
  }
}

// Exports
export default ParamVariable;