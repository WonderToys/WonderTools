import { join } from 'path';
import { connect } from 'camo';
import { remote } from 'electron';

import Vue from 'vue/dist/vue';

import errorHandler from './errorHandler.js';

import Client from './bot/Client';
import App from './client/App.vue';

// Connect to db
const uri = `nedb://${ join(remote.app.getPath('userData'), 'store.db') }`;
connect(uri)
  .then(() => Client.getClient().load())
  .then(() => {
    // Mount Vue
    const vm = new Vue({
      render: h => h(App),
    }).$mount('app');
  });