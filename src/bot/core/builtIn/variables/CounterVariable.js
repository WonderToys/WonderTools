"use strict";

const commandManager = require('../../core/command/commandManager');
const Variable = require('../../core/variable/Variable');

// -----
//  CounterVariable
// -----

class CounterVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$counter';
  }

  get description() {
    return 'Get the counter for the specified command';
  }

  get usage() {
    return '$counter(NAME)';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    if ( args.length > 0 ) {
      const command = commandManager.getOne(args[0], request.messageType);
        
      if ( command == null ) {
        return null;
      }

      return command.metadata.counter;
    }

    return null;
  }
}

// Exports
module.exports = CounterVariable;