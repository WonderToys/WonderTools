import { join } from 'path';
import { connect } from 'camo';
import { remote } from 'electron';

import Vue from 'vue/dist/vue';

import { logger, twitchLogger } from './logger';
import errorHandler from './errorHandler.js';

import Client from './bot/Client';
import App from './client/App.vue';

// Connect to db
const uri = `nedb://${ join(remote.app.getPath('userData'), 'store.db') }`;
connect(uri)
  .then(() => {
    const client = Client.getClient();
    client._logger = logger;
    client._twitchLogger = twitchLogger;
    
    return client.load();
  })
  .then(() => {
    // Mount Vue
    const vm = new Vue({
      render: h => h(App),
    }).$mount('app');
  });