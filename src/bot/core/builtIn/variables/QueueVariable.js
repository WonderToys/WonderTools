import Variable from '../../variable/Variable';
// -----
//  QueueVariable
// -----

class QueueVariable extends Variable {
  constructor() {
    super();

    this._queues = {};
  }
  // -----
  //  Properties
  // -----

  get name() {
    return '$queue';
  }

  get description() {
    return 'Get, remove, or add to a queue. QUEUE NAME defaults to the name of the called command. WHAT defaults to viewer who called the command.';
  }

  get usage() {
    return '$queue(add|pop|remove, [QUEUE NAME], WHAT)';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    if ( args.length === 0 ) {
      return null;
    }

    const queueCommand = args[0].toLowerCase();
    let queueName = request.command;
    let queuer = request.viewer.username;

    if ( args.length >= 2 ) {
      queueName = args[1].toLowerCase();
    }

    queueName = queueName.toLowerCase();

    if ( args.length >= 3 ) {
      queuer = args[2].toLowerCase();
    }

    if ( this._queues[queueName] == null ) {
      this._queues[queueName] = [];
    }

    switch ( queueCommand ) {
      case 'add': {
        this._queues[queueName].push(queuer);
        return this._queues[queueName].length;
      }

      case 'pop': {
        if ( this._queues[queueName].length === 0 ) {
          return '';
        }
        
        return this._queues[queueName].shift();
      }

      case 'remove': {
        this._queues[queueName].filter((u) => u !== queuer);
        return this._queues[queueName].length;
      }
    }

    return null;
  }
}

// Exports
export default QueueVariable;