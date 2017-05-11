import moment from 'moment';

import { getStreamInfo } from '../../../../api/twitch';
import { Command } from '../../command/Command';
import Globals from '../../../Globals';

// -----
//  ActiveCommand
// -----

class ActiveCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!uptime';
  }

  get name() {
    return 'Uptime';
  }

  get description() {
    return 'How long has the stream been live?';
  }

  get cooldown() {
    return 30000;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    if ( Globals.streamCreatedAt == null ) {
      return reply(`Surely you can tell that ${ Globals.streamerName } is not live... right?!`);
    }

    const duration = moment.duration(moment() - moment(Globals.streamCreatedAt));
    let uptime = moment.utc(duration.asMilliseconds()).format('h [hours], m [minutes], [and] s [seconds]')  
    if ( duration.asHours() <= 0 ) {
      uptime = moment.utc(duration.asMilliseconds()).format('m [minutes], [and] s [seconds]')
    }

    reply(`${ Globals.streamerName } has been live for ${ uptime }`);
  }
};

// Register
export default ActiveCommand;