import { Command } from './Command';

import builtInCommands from '../builtIn/commands/index';

// -----
//  Fields
// -----

const PARAM_NAME_REGEX = /\w+/g;

// -----
//  CommandStore
// -----

class CommandStore {
  constructor() {
    this._commands = [];
    this._commandsByType = {};
  }

  // -----
  //  Private
  // -----

  _register(command) {
    return new Promise((resolve, reject) => {
      if ( command == null || (command.command == null || command.command.length === 0) ) {
        reject(new Error('Command not provided!'));
      }

      if ( typeof(command.action) !== 'function' ) {
        reject( new Error('The command must have an action!'));
      }

      if ( this._commands.find(c => c.command === command.command) != null ) {
        reject(new Error(`A ${ command.command } command already exists!`));
      }

      let messageTypes = command.messageTypes;
      if ( !Array.isArray(messageTypes) || messageTypes.length === 0 ) {
        messageTypes = [ 'chat' ];
      }

      command._loadConfig()
        .then(() => {
          // Register command
          this._commands.push(command);

          // Register command by message type
          messageTypes.forEach((mt) => {
            if ( this._commandsByType[mt] == null ) {
              this._commandsByType[mt] = {};
            }

            this._commandsByType[mt][command.command] = command;
          });

          resolve();
        });
    });
  }

  // -----
  //  Public
  // -----

  getOne(command, messageType) {
    const cmds = this._commandsByType[messageType];
    if ( cmds != null ) {
      return cmds[command];
    }
  }

  load() {
    this._commands = [];
    this._commandsByType = {};

    return new Promise((resolve, reject) => {
      const promises = [];

      // Add built-in commands
      promises.concat(builtInCommands.map((cmd) => {
        return this._register(cmd);
      }));

      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }
};

// Exports
export default new CommandStore();