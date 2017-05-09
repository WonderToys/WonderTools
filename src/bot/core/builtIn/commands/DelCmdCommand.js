import commandStore from '../../command/commandStore'; 
import { Command } from '../../command/Command'; 

// -----
//  DelCmdCommand
// -----

class DelCmdCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!delcmd';
  }

  get usage() {
    return '!addcmd [name]'
  }

  get name() {
    return 'DeleteCommand';
  }

  get description() {
    return 'Delete a custom command.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    if ( params.length < 1 ) {
      return reply(`USAGE: ${ this.usage }`);
    }

    const commandName = params[0];
    commandStore._removeCustomCommand(commandName)
      .then((result) => {
        reply(`I've successfully removed the ${ commandName } command. You're welcome.`);
      })
      .catch((result) => {
        reply('Dang it! I screwed up trying to remove this command. Nah, it was probably you.');
      });
  }
};

// Exports
export default DelCmdCommand;