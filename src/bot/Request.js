import uuid from 'node-uuid';

// -----
//  Request
// -----

class Request {
  constructor(channel, message, messageType, viewer) {
    this._requestId = uuid.v4();
    this._channel = channel;
    this._message = message;
    this._messageType = messageType;
    this._viewer = viewer;
    this._username = viewer.username;

    this._command = null;
    this._params = null;
  }

  // -----
  //  Properties
  // -----

  get requestId() {
    return this._requestId;
  }

  get channel() {
    return this._channel;
  }

  get command() {
    return this._command;
  }

  get params() {
    return this._params;
  }

  get messageType() {
    return this._messageType;
  }

  get username() {
    return this._username;
  }

  get viewer() {
    return this._viewer;
  }

  get message() {
    return this._message;
  }

  get config() {
    return this._config;
  }

  get metadata() {
    return this._metadata;
  }
};

export default Request;