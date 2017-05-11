import { Document } from 'camo';

// -----
//  Timer
// -----

class Timer extends Document {
  constructor() {
    super();

    this.message = String;

    this.interval = {
      type: Number,
      default: 1
    };

    this.isEnabled = {
      type: Boolean,
      default: true
    };
  }

  // -----
  //  Hooks
  // -----

  preSave() {
    if ( this.interval < 1 ) {
      this.interval = 1;
    }

    return Promise.resolve(this);
  }
};

// Exports
export default Timer;