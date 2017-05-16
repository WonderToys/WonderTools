<!--
  Template
-->
<template lang="jade">
div#authModal.modal
  div.modal-content
    p.text-red.darken-2 Your bot cannot connect to Twitch until you authorize both your bot's account and your streaming account.
    div.row
      div(v-if="config == null || config.botAccessToken == null")
        a(href="#", v-on:click="authorize('bot')", :class="{ disabled: authingbot }").btn.waves-effect.waves-light.col.s12 
          span(v-if="authingbot") Authorizing ...
          span(v-else) Authorize Bot
      div(v-else)
        a(href="#", v-on:click="deauthorize('bot')").btn.waves-effect.waves-light.col.s12 
          span Deauth {{ config.botName }}

    div.row
      div(v-if="config == null || config.streamerAccessToken == null")
        a(href="#", v-on:click="authorize('streamer')", :class="{ disabled: authingstreamer }").btn.waves-effect.waves-light.col.s12
          span(v-if="authingstreamer") Authorizing ...
          span(v-else) Authorize Streamer
      div(v-else)
        a(href="#", v-on:click="deauthorize('streamer')").btn.waves-effect.waves-light.col.s12
          span Deauth {{ config.streamerName }}
</template>

<!--
  Style
-->
<style scoped lang="less">
#authModal {
  width: 320px;

  p { 
    margin-top: 0px; 
    color: #d32f2f;
  }

  .row:last-child {
    margin-bottom: 0;
  }
}
</style>


<!--
  Script
-->
<script>
import { ipcRenderer } from 'electron';

export default {
  props: [ 'config' ],
  data() {
    return {
      authingbot: false,
      authingstreamer: false,
    };
  },
  mounted() {
    $('#authModal').modal();
  },
  methods: {
    authorize(kind) {
      this[`authing${ kind }`] = true;
      ipcRenderer.once('twitch-auth-reply', (event, args) => {
        if ( args.kind != null ) {
          this.config[`${ args.kind }Name`] = args.response.display_name;;
          this.config[`${ args.kind }AccessToken`] = args.response.access_token;
          this.config[`${ args.kind }RefreshToken`] = args.response.refresh_token;
          this.config[`${ args.kind }UserId`] = args.response.user_id;

          this.config.save();
        }

        this[`authing${ kind }`] = false;

        if ( this.config.botAccessToken != null && this.config.streamerAccessToken != null ) {
          $('#authModal').modal('close');
        }
      });

      ipcRenderer.send('twitch-auth', kind);
    },

    deauthorize(kind) {
      this.config[`${ kind }Name`] = null;
      this.config[`${ kind }AccessToken`] = null;
      this.config[`${ kind }RefreshToken`] = null;
      this.config[`${ kind }UserId`] = null;

      this.config.save();
    }
  }, //- methods
}
</script>