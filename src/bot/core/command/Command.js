import moment from 'moment';
import Persistable from '../../Persistable';

import Viewer from '../viewer/Viewer';

// -----
//  CommandConfig
// -----

class CommandConfig extends Persistable {
  constructor() {
    super();

    this.command = {
      type: String,
      required: true
    };

    this.isCustom = {
      type: Boolean,
      default: false
    };

    this.actionString = {
      type: String,
      default: null
    };

    this.cooldown = {
      type: Number,
      default: 0
    };

    this.userCooldown = {
      type: Number,
      default: 0
    };

    this.messageTypes = {
      type: [ String ],
      default: [ 'chat' ]
    };

    this.accessLevel = {
      type: Number,
      default: Viewer.LEVEL_VIEWER
    };

    this.counterType = {
      type: Number,
      default: Command.COUNTER_NONE
    };

    this.isEnabled = {
      type: Boolean,
      default: true
    };

  }
};

// -----
//  Command
// -----

class Command {
  constructor() {
    this._cooldownTimers = {};
    this._config = {};
  }

  // -----
  //  Properties
  // -----

  get config() {
    return this._config;
  }

  get command() {
    return this._command || this.config.command;
  }

  get isCustom() {
    return this.config.isCustom;
  }

  get isEnabled() {
    return this.config.isEnabled;
  }

  get messageTypes() {
    return this.config.messageTypes;
  }

  get accessLevel() {
    return this.config.accessLevel;
  }

  get cooldown() {
    return this.config.cooldown;
  }

  get userCooldown() {
    return this.config.userCooldown;
  }

  get metadata() {
    const meta = this._config.metadata;
    return meta || {};
  }

  get counterType() {
    return this.config.counterType;
  }

  // -----
  //  Private
  // -----

  _trackCooldown(username) {
    const now = moment().valueOf();

    if ( this.cooldown > 0 ) {
      this._cooldownTimers['$global'] = now;
    }

    if ( this.userCooldown > 0 ) {
      this._cooldownTimers[username] = now;
    }
  }

  _trackCounter(increase) {
    increase = increase || 1;

    if ( this.metadata.counter == null ) {
      this.metadata.counter = 0;
    }

    this.metadata.counter += increase;
    this.save();

    return this.metadata.counter;
  }

  // -----
  //  Public
  // -----

  loadConfig() {
    return CommandConfig.findOne({ command: this.command })
      .then((config) => {
        if ( config != null ) {
          this._config = config;
          return this._config;
        }
        else {
          const newConfig = Object.assign({ command: this.command }, this.defaultConfig());
          return CommandConfig.create(newConfig)
            .save()
            .then((config) => {
              this._config = config;
            });
        }
      });
  }
  
  save() {
    return this.config.save();
  }

  defaultConfig() {
    return {};
  }

  enable(enabled) {
    this.config.isEnabled = enabled;
    return this.save();
  }

  canExecute(viewer) {
    return viewer.accessLevel <= this.accessLevel;
  }

  onCooldown(viewer) {
    const username = viewer.username.toLowerCase();

    if ( this.cooldown <= 0 && this.userCooldown <= 0 ) {
      return false;
    }

    if ( this.config.bypassCooldownLevel != null && viewer.accessLevel <= this.config.bypassCooldownLevel ) {
      return false;
    }

    const globalCD = this.cooldown / 1000;
    const userCD = this.userCooldown / 1000;

    // Check Global Cooldown
    const now = moment();

    if ( this._cooldownTimers['$global'] != null ) {
      const lastGlobal = moment(this._cooldownTimers['$global']);
      const globalDiff = Math.round(moment.duration(now.diff(lastGlobal)).asSeconds());

      if ( globalDiff < globalCD ) {
        return moment.duration(globalCD - globalDiff, 'seconds');
      }
    } 

    // Check User Cooldown
    if ( username != null && this._cooldownTimers[username] != null ) {
      const lastUser = moment(this._cooldownTimers[username]);
      const userDiff = Math.round(moment.duration(now.diff(lastUser)).asSeconds());

      if ( userDiff < userCD ) {
        return moment.duration(userCD - userDiff, 'seconds');
      }
    }

    return false;
  }

  action(request, reply) {
    if ( this.isCustom === true ) {
      return reply(this.config.actionString);
    }

    return Promise.resolve(true);
  }

  // -----
  //  Static
  // -----

  static get COUNTER_NONE() {
    return 1;
  }

  static get COUNTER_AUTOMATIC() {
    return 2;
  }

  static get COUNTER_MANUAL() {
    return 3;
  }
};

// Exports
export { Command };