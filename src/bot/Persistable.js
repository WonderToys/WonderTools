import { Document } from 'camo';

// -----
//  Persistable
// -----

class Persistable extends Document {
  constructor() {
    super();

    this.metadata = {
      type: Object,
      default: {}
    };
  }
};

// Exports
export default Persistable;