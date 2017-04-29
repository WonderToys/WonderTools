import moment from 'moment';

import Viewer from './Viewer';
import * as twitch from '../../../api/twitch';

// -----
//  Fields
// -----

const UPDATE_TIMEOUT = 1000 * 60 * 5;

let _interval = null;
let _channel = null;
let _channelId = null;

// -----
//  ViewerStore
// -----

class ViewerStore {
  constructor() {
    this._liveViewers = [];
  }

  // -----
  //  Private
  // -----

  _getViewerByName(username) {
    return Viewer.findOne({ username });
  }

  _findOrCreateUsers(viewers) {
    const promises = viewers.map(v => this.findOrCreateUser(v.username, v));
    return Promise.all(promises);
  }

  _updateTimes(viewer, chatted) {
    const now = new Date();
    if ( viewer.lastSeen != null ) {
      const end = moment(viewer.lastSeen);
      const start = moment(now);

      viewer.timeHere += moment.duration(end.diff(start)).asMinutes();
    }

    viewer.lastSeen = now;
    if ( chatted === true ) {
      viewer.lastChatted = now;
    }

    return viewer.save();
  }

  _updateUserId(viewer) {
    if ( viewer.userId == null ) {
      return twitch.getUserId(viewer.username)
        .then((user) => {
          viewer.userId = user._id;
          viewer.displayName = user.display_name;

          return viewer;
        });
    }

    return viewer;
  }

  _updateFollowing(viewer) {
    return twitch.getUserFollowsChannel(viewer.userId, _channelId)
      .then((follows) => {
        if ( follows === false ) {
          viewer.isFollower = follows;
          viewer.followDate = null;
        }
        else {
          viewer.isFollower = true;
          viewer.followDate = follows;
        }

        return viewer.save();
      });
  }

  // -----
  //  Public
  // -----

  load(channel, channelId) {
    _channel = channel;
    _channelId = channelId;

    _interval = setInterval(() => this.updateLiveViewers, UPDATE_TIMEOUT);

    return this.updateLiveViewers();
  }

  unload() {
    _channel = null;
    if ( _interval != null ) clearInterval(_interval);

    return Promise.resolve(true);
  }

  findOrCreateUser(username, data) {
    return this._getViewerByName(username)
      .then((viewer) => {
        if ( viewer == null ) {
          data = Object.assign(data, { username });
          return Viewer.create(data)
            .save();
        }
        else if ( data != null ) {
          for ( let key in data ) {
            viewer[key] = data[key];
          }

          return viewer.save();
        }

        return viewer;
      });
  }

  updateLiveViewers() {
    return twitch.getViewers(_channel, true)
      .then(vs => this._findOrCreateUsers(vs))
      .then((vs) => {
        const promises = vs.map(v => this._updateTimes(v, false));
        return Promise.all(promises)
      })
      .then((vs) => {
        this._liveViewers = vs;
        return this._liveViewers;
      });
  }

  trackActive(username, isActive, data, inChat) {
    data = data || {};

    return this.findOrCreateUser(username, data)
      .then(v => this._updateUserId(v))
      .then(v => this._updateTimes(v, inChat))
      .then((viewer) => {
        this._liveViewers = (this._liveViewers || []).filter((v) => {
          return v.username.toLowerCase() !== viewer.username.toLowerCase();
        });

        if ( isActive === true ) {
          this._liveViewers.push(viewer);
        }

        return viewer.save();
      });
  }
};

// Exports
export default new ViewerStore();