import tmi from 'tmi.js';
import moment from 'moment';

import commandStore from './core/command/commandStore';
import variableStore from './core/variable/variableStore';
import viewerStore from './core/viewer/viewerStore';
import moduleStore from './core/module/moduleStore';
import Request from './Request';

import { resolve as resolveCommand, execute as executeCommand } from './resolvers/commandResolver';
import { resolve as resolveVariable } from './resolvers/variableResolver';

// -----
//  Client
// -----
class Client {
  constructor(config) {
    this._botName = config.botName;
    this._streamerName = config.streamerName;

    this._accessToken = config.botAccessToken;
    this._refreshToken = config.botRefreshToken;

    this._channel = `#${ this._streamerName }`;
    this._channelId = config.streamerUserId;
    
    this._channel = '#slevin_4';
    this._channelId = '109589541';

    // this._channel = '#pookajutsu';
    // this._channelId = '29181653';

    this._isConnecting = false;

    this._ircClient = new tmi.client({
      options: {
        debug: true,
      },
      connection: {
        reconnect: true,
      },
      identity: {
        username: this._botName,
        password: `oauth:${ this._accessToken }`
      },
      channels: [ this._channel ]
    });
  } //- constructor()

  // -----
  //  Properties
  // -----

  get connected() {
    return this._ircClient != null && this._ircClient.readyState() === 'OPEN';
  }

  // -----
  //  Private
  // -----

  // _wrapReply()
  _wrapReply(request, reply) {
    return function wrappedReply(message) {
      resolveVariable(message, request)
        .then((result) => {
          reply(request.channel, result);
        })
        .catch((error) => {
          console.error(error);
        });
    };
  }; //- _wrapReply()

  // _getReply()
  _getReply(request) {
    const client = this._ircClient;
    const messageType = request.messageType;

    let reply = client[messageType];
    if ( messageType === 'chat' ) reply = client.say;

    const wrappedReply = this._wrapReply(request, reply.bind(client));

    wrappedReply.say = this._wrapReply(request, client.say.bind(client));
    wrappedReply.whisper = this._wrapReply(request, client.whisper.bind(client));

    return wrappedReply;
  }; //- _getReply()

  // _setupListeners()
  _setupListeners() {
    const client = this._ircClient;
    const me = this._streamerName;

    return new Promise((resolve, reject) => {
      // join
      client.on('join', (channel, user) => {
        if ( this._isConnecting === true ) return;

        viewerStore.trackActive(user, true);

        if ( user === me ) {
          if ( !client.isMod(channel, me) && channel !== `#${ me }`) {
            console.warn(`[ WT ] [ WARN ] Not a mod in channel ${ channel }`)
          }
        }
      }); //- join

      // part
      client.on('part', (channel, user) => {
        if ( this._isConnecting === true ) return;

        viewerStore.trackActive(user, false);
      }); //- part

      // message
      client.on('message', (channel, userState, message, isSelf) => {
        if ( this._isConnecting === true ) return;
        if ( userState.username.toLowerCase() === this._botName.toLowerCase() ) return;

        const messageType = userState['message-type'];
        const badges = userState['badges'];
        const userData = {
          username: userState.username,
          userId: userState['user-id'],
          displayName: userState['display-name'],
          isBroadcaster: badges != null && badges.broadcaster === '1',
          isModerator: userState.mod,
          isSubscriber: userState.subscriber
        };

        viewerStore.trackActive(userData.username, true, userData, true)
          .then((viewer) => {
            const request = new Request(channel, message, messageType, viewer);
            this._handleRequest(request);
          });
      }); //- message

      resolve();
    });
  }; //- _setupListeners()

  // _handleRequest()
  _handleRequest(request) {
    const message = request.message;
    const messageType = request.messageType;
    const username = request.username;
    const viewer = request.viewer;

    const parsed = resolveCommand(message, messageType);
    const reply = this._getReply(request);

    // if ( parsed == null ) {    
    //   const modSystem = systemManager.getOne('$ModSystem');

    //   if ( modSystem != null && modSystem.hasLinks(message, viewer) === true ) {
    //     const linksConfig = modSystem.config;

    //     reply(`/timeout $user ${ linksConfig.linkTimeoutLength }`);
    //     reply(`Hey $user, we don't allow that kind 'round here! (Link timeout: ${ linksConfig.linkTimeoutLength }s)`);

    //     return;
    //   }
    // }

    if ( parsed != null && parsed.command.metadata.enabled !== false ) {
      const cooldown = parsed.command.onCooldown(viewer);
      if ( cooldown !== false && moment.isDuration(cooldown) ) {
        const secs = Math.round(cooldown.asSeconds());
        reply(`Hey $user, you have another ${ secs }s to wait before you can execute that again!`);
        return;
      }

      // Ensure we can afford the command
      // if ( parsed.command.pointCost != null && parsed.command.pointCost > 0 ) {
      //   if ( viewer.points.amount < parsed.command.pointCost ) {
      //     reply(`Hey ${ viewer.displayName }, you can't afford that action! FeelsBadMan`);
      //     return;
      //   }
      // }

      // Ensure we have a high enough access level
      if ( parsed.command.canExecute(viewer) ) {
        request._command = parsed.commandText;
        request._params = parsed.params;
        request._metadata = parsed.command.metadata;

        executeCommand(parsed.command, request, reply);
      }
    }
  }; //- _handleRequest()

  // -----
  //  Public
  // -----

  connect() {
    this._isConnecting = true;

    return commandStore.load()
      .then(() => variableStore.load())
      .then(() => this._setupListeners())
      .then(() => this._ircClient.connect())
      .then(() => viewerStore.load(this._channel, this._channelId))
      .then(() => moduleStore.load())
      .then(() => {
        this._isConnecting = false;
      })
      .catch((e) => { 
        throw e; 
      });
  } //- connect()

  disconnect() {
    return this._ircClient
      .disconnect()
      .then(() => viewerStore.unload());
  } //- disconnect()

  // -----
  //  Static
  // -----

  static getClient(config) {
    if ( global.WT_CLIENT == null ) {
      global.WT_CLIENT = new Client(config);
    }

    return global.WT_CLIENT;
  } //- getClient()
};

// Exports
export default Client;