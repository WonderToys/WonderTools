import request from 'request';
import appConfig from '../../config';

// -----
//  Fields
// -----

const ROOT_URL = 'https://api.twitch.tv/kraken';

// -----
//  Helpers
// -----

// _getDefaultHeaders()
const _getDefaultHeaders = function _getDefaultHeaders() {
  return {
    "Accept": "application/vnd.twitchtv.v5+json",
    "Client-ID": appConfig.twitch.clientId,
  };
}; //- _getDefaultHeaders()

// _chunkArray()
const _chunkArray = function _chunkArray(array, size) {
  return array.reduce((current, item, index, arr) => {
    return !(index % size) ? current.concat([arr.slice(index, index + size)]) : current;
  }, []);
}; //- _chunkArray()

// _getUri()
const _getUri = function _getUri(which) {
  return `${ ROOT_URL }${ which }`;
}; //- _getUri()

// _get()
const _get = function _get(url) {
  return new Promise((resolve, reject) => {
    request({
      url, method: 'GET',
      headers: _getDefaultHeaders()
    }, (err, resp, body) => {
      if ( err != null ) return reject(err);
      resolve(body);
    });
  });
}; //- _get()

// -----
//  Exports
// -----

// getViewers()
export const getViewers = function getViewers(channel, retry) {
  channel = channel.replace('#', '');
  return _get(`https://tmi.twitch.tv/group/user/${ channel.toLowerCase() }/chatters`)
    .then((body) => {
      body = JSON.parse(body);

      const chatters = body.chatters || {};
      if ( body.chatters == null ) {
        console.log('[ WT ] Failed to load chatters, trying agian ....');

        if ( retry ) {
          return getViewers(channel);
        }
        else {
          return [];
        }
      }

      const viewers = [];
      Object.keys(chatters).forEach((key) => {
        const array = chatters[key];
        array.forEach((viewer) => {
          viewers.push({
            username: viewer,
            isModerator: key.toLowerCase() !== 'viewers'
          });
        });
      });

      return viewers;
    });
}; //- getViewers()

// getUser()
export const getUser = function getUser(username) {
  return _get(_getUri(`/users?login=${ username }&api_version=5`))
    .then((data) => {
      if ( data == null ) return null;

      data = JSON.parse(data);
      return data.users[0];
    });
}; //- getUser()

// getChannelInfo()
export const getChannelInfo = function getChannelInfo(channel) {
  channel = channel.replace('#', '');

  return getUser(channel)
    .then((user) => {
      if ( user != null && user._id != null ) {
        const url = _getUri(`/channels/${ user._id }`);
        return _get(url).then((data) => JSON.parse(data));
      }

      return null;
    })
}; //- getChannelInfo()

// getUserFollowsChannel()
export const getUserFollowsChannel = function getUserFollowsChannel(userId, channel) {
  channel = channel.replace('#', '');

  const url = _getUri(`/users/${ userId }/follows/channels/${ channel }`);
  return _get(url)
    .then((body) => {
      const result = JSON.parse(body);
      if ( result.status === 404 ) {
        return false;
      }

      return new Date(result.created_at);
    });
}; //- getUserFollowsChannel()

// getStreamInfo()
export const getStreamInfo = function getStreamInfo(channel) {
  const url = _getUri(`/streams/${ channel }`);
  return _get(url)
    .then((body) => {
      if ( body == null ) return body;

      return JSON.parse(body);
    });
}; //- getStreamInfo()