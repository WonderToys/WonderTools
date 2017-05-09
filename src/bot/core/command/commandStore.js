import { Command, CommandConfig } from './Command';

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

    if ( typeof(command.action) !== 'function' && (command.isCustom === true && typeof(command.actionString) != 'string') ) {
      throw new Error('The command must have an action!');
    }

    return command.loadConfig()
      .then(() => {
        this._commands.push(command)
        return command;
      });
  }

  _loadCustom() {
    return CommandConfig.find({ isCustom: true })
      .then((configs) => {
        if ( !Array.isArray(configs) ) configs = [];

        return Promise.all(configs.map((config) => {
          const custom = new Command(config);
          return this._register(custom);
        }));
      });
  }

  _createCustomCommand(data) {
    data.isCustom = true;
    return CommandConfig.create(data)
      .save()
      .then((config) => {
        const command = new Command(config);
        return this._register(command);
      });
  }

  _removeCustomCommand(command) {
    return CommandConfig.deleteOne({ command, isCustom: true })
      .then(() => {
        this._commands = this._commands.filter(c => c.command.toLowerCase() !== command.toLowerCase());
        return true;
      });
  }

  // -----
  //  Public
  // -----

  exists(command) {
    return this._commands.some(c => c.command.toLowerCase() === command.toLowerCase());
  }

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

    // Add custom commands
    promises.concat(this._loadCustom());

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