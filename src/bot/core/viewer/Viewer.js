import Persistable from '../../Persistable';
import * as twitch from '../../../api/twitch';

// -----
//  Viewer
// -----

class Viewer extends Persistable {
  constructor() {
    super();

    this.userId = String;
    this.username = String;
    this.displayName = String;

    this.isModerator = {
      type: Boolean,
      default: false
    };

    this.isFollower = {
      type: Boolean,
      default: null
    };

    this.isSubscriber = {
      type: Boolean,
      default: null
    };

    this.isBroadcaster = {
      type: Boolean,
      default: false
    };

    this.isActive = {
      type: Boolean,
      default: false
    };

    this.lastSeen = {
      type: Date,
      default: null
    };

    this.lastChatted = {
      type: Date,
      default: null
    };

    this.timeHere = {
      type: Number,
      default: 0
    };

    this.followDate = {
      type: Date,
      default: null
    };
  }

  // -----
  //  Properties
  // -----

  get accessLevel() {
    if ( this.isBroadcaster === true ) {
      return Viewer.LEVEL_GOD;
    }

    if ( this.isModerator === true ) {
      return Viewer.LEVEL_MOD;
    }

    if ( this.isSubscriber === true ) {
      return Viewer.LEVEL_SUBSCRIBER;
    }

    if ( this.isFollower === true ) {
      return Viewer.LEVEL_FOLLOWER;
    }

    return Viewer.LEVEL_VIEWER;
  }

  // -----
  //  Hooks
  // -----

  preSave() {
    if ( this.displayName == null ) {
      this.displayName = this.username;
    }

    return Promise.resolve(this);
  }

  // -----
  //  Static
  // -----

  static get LEVEL_GOD() {
    return 0;
  }

  static get LEVEL_MOD() {
    return 1;
  }

  static get LEVEL_SUBSCRIBER() {
    return 2;
  }

  static get LEVEL_FOLLOWER() {
    return 3;
  }

  static get LEVEL_VIEWER() {
    return 4;
  }
};

// Exports
export default Viewer;