<!--
  Template
-->
<template lang="jade">
div#appBar
  nav.fixed-bottom.light-blue.darken-2
    div.nav-wrapper
      ul.left
        li
          a(href="#", style="color: #444; padding: 0 1rem; width: 54px;", v-on:click="showAuthModal").btn.waves-effect.waves-orange.white
            i.material-icons group
        li
          a(href="#", :class="{ disabled: !canConnect() || connecting }", v-on:click="toggleBot").btn.waves-effect.waves-light.orange 
            span(v-if="!connected && !connecting") Connect
            span(v-else-if="connecting") Connecting
            span(v-else) Disconnect
      ul.right
        li
          a(href="#", style="color: #444; padding: 0 1rem; width: 54px;").btn.waves-effect.waves-orange.white
            i.material-icons settings

  auth-modal(:config="config", wait-for="config")
</template>

<!--
  Style
-->
<style scoped lang="less">
nav.fixed-bottom {
  position: fixed;
  bottom: 0;
  border-top: 1px solid #0277bd;
  box-shadow: none;
}
</style>

<!--
  Script
-->
<script>
import Config from '../../models/Config';
import Client from '../../../bot/Client';

import AuthModal from '../authModal/AuthModal.vue';

export default {
  components: {
    AuthModal
  },
  data() {
    return {
      config: null,
      connected: false,
      connecting: false,
    };
  },
  watch: {
    config() {
      if ( !this.canConnect() ) {
        this.showAuthModal();
      }
    }
  },
  methods: {
    canConnect() {
      return this.config != null && this.config.botAccessToken != null
             && this.config.streamerAccessToken != null;
    },
    loadConfig() {
      Config.findOne({})
        .then((doc) => {
          let config = doc;
          if ( config == null ) {
            config = Config.create({});
          }

          this.config = config;
        });
    },
    showAuthModal() {
      $('#authModal').modal('open');
    },
    toggleBot() {
      if ( this.connected ) {
        Client.getClient()
          .disconnect()
          .then(() => {
            this.connecting = false;
            this.connected = false;
          });
      }
      else {
        this.connecting = true;
        Client.getClient()
          .connect(this.config)
          .then(() => {
            this.connecting = false;
            this.connected = true;
          });
      }
    }
  },
  created() {
    this.loadConfig();
  }
}
</script>