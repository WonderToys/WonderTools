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
    if ( command == null || (command.command == null || command.command.length === 0) ) {
      throw new Error('Command not provided!');
    }

    if ( typeof(command.action) !== 'function' ) {
      throw new Error('The command must have an action!');
    }

    let messageTypes = command.messageTypes;
    if ( !Array.isArray(messageTypes) || messageTypes.length === 0 ) {
      messageTypes = [ 'chat' ];
    }

    return command.loadConfig()
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

    const promises = [];

    // Add built-in commands
    promises.concat(builtInCommands.map((cmd) => {
      return this._register(cmd);
    }));

    return Promise.all(promises);
  }

  unload() {
    this._commands.forEach((cmd) => {
      if ( typeof(cmd.unload) === 'function' ) {
        cmd.unload();
      }
    });

    this._commands = [];
    this._commandsByType = {};
  }
};

// Exports
export default new CommandStore();