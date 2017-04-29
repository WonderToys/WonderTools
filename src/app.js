import { join } from 'path';
import { connect } from 'camo';
import { remote } from 'electron';

import Vue from 'vue';

import App from './client/App.vue';

// Connect to db
const uri = `nedb://${ join(remote.app.getPath('userData'), 'store.db') }`;
connect(uri)
  .then((db) => {
    // Mount Vue
    const vm = new Vue({
      render: h => h(App),
    }).$mount('app');
  });
