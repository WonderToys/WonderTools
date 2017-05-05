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

    return command.loadConfig()
      .then(() => {
        this._commands.push(command)
        return command;
      });
  }

  // -----
  //  Public
  // -----

  getOne(command, messageType) {
    return this._commands.find((cmd) => {
      return cmd.messageTypes.some(t => t.toLowerCase() === messageType.toLowerCase()) && cmd.command === command;
    });
  }

  load() {
    this._commands = [];

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
  }
};

// Exports
export default new CommandStore();