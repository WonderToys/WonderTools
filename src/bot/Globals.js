import Client from './Client';

// -----
//  Globals
// -----

class Globals {
  // -----
  //  Properties
  // -----
  get channel() {
    return Client.getClient()._channel;
  }

  get channelId() {
    return Client.getClient()._channelId;
  }

  get botName() {
    return Client.getClient()._botName;
  }

  get streamerName() {
    return Client.getClient()._streamerName;
  }

  get connected() {
    return Client.getClient().connected;
  }

  // -----
  //  Public
  // -----
  say(message) {
    return Client.getClient()._ircClient.say(this.channel, message);
  }

  whisper(user, message) {
    return Client.getClient()._ircClient.whisper(user, message);
  }
}

// Exports
export default new Globals();