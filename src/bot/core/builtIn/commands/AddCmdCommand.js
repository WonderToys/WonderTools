import commandStore from '../../command/commandStore'; 
import Viewer from '../../viewer/Viewer';
import { Command } from '../../command/Command'; 

// -----
//  AddCmdCommand
// -----

class AddCmdCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!addcmd';
  }

  get usage() {
    return '!addcmd [name] "[response]" [--flags]'
  }

  get name() {
    return 'AddCommand';
  }

  get description() {
    return 'Add a command to the bot';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    if ( params.length < 2 ) {
      return reply(`USAGE: ${ this.usage }`);
    }

    if ( commandStore.exists(params[0]) ) {
      return reply(`I already have a ${ params[0] } command. Womp womp.`);
    }

    const commandData = {
      command: params[0],
      actionString: params[1],
      counterType: parseInt(params.flags['counterType']) || Command.COUNTER_NONE,
      accessLevel: parseInt(params.flags['accessLevel']) || Viewer.LEVEL_VIEWER,
      cooldown: parseInt(params.flags['cooldown']) || 0,
      userCooldown: parseInt(params.flags['userCooldown']) || 0
    };

    // Create our command
    commandStore._createCustomCommand(commandData)
      .then((command) => {
        reply(`I've successfully created the ${ command.command } command. You're welcome.`);
      })
      .catch((error) => {
        reply('Dang it! I screwed up trying to create this command. Nah, it was probably you.');
      });
  }
};

// Exports
export default AddCmdCommand;