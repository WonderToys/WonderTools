<!--
  Template
-->
<template lang="jade">
div#streamPanel.gallery-curve-wrapper.disabled
  div.gallery-header
    span Stream Info
    p.caption
      span#botOffline(v-if="!connected")
        | Stream information will be available once the bot is connected to your channel!
      span#streamInfo(v-if="connected")
        span#streamStatus
          span.green-text(v-if="online === true") Online 
          span(v-if="online === true") for {{ upSince }}
          span.red-text(v-if="online !== true") Offline
        span#streamViewers(v-if="online === true")
          span with 
          span.orange-text {{ viewerCount }} 
          span viewers
        span#streamGame(v-if="online === true")
          span playing 
          span: em {{ streamGame }}
          
  div.gallery-body
    div.title-wrapper
      h4 Stream Info
    div.content(v-if="isActive")
</template>

<!--
  Styles
-->
<style scoped lang="less">
p.caption {
  > span {
    display: inline-block;
  }

  #streamInfo {
    > span {
      display: block;
    }
  }
}
</style>

<!--
  Script
-->
<script>
import moment from 'moment';

import Client from '../../../../bot/Client';
import Globals from '../../../../bot/Globals';

import * as twitch from '../../../../api/twitch';

let interval = null;

export default {
  data() {
    return {
      online: false,
      streamTitle: '',
      streamGame: '',
      upSince: '',
      viewerCount: 0,
      connected: false
    }
  },
  methods: {
    setStreamInfo(data) {
      if ( data == null ) {
        this.online = false;
        this.streamTitle = '';
        this.streamGame = '';
        this.upSince = '';
        this.viewerCount = 0;

        Globals.streamCreatedAt = null;

        return;
      }

      const duration = moment.duration(moment() - moment(data.stream.created_at));

      this.streamGame = data.stream.game;
      this.streamTitle = data.stream.channel.status;
      if ( duration.asHours() >= 1 ) {
        this.upSince = moment.utc(duration.asMilliseconds()).format('hh:mm:ss')  
      }
      else {
        this.upSince = moment.utc(duration.asMilliseconds()).format('mm:ss')
      }
      
      this.viewerCount = data.stream.viewers;
      this.online = true;

      Globals.streamCreatedAt = data.stream.created_at;
    },
  },
  mounted() {
    const client = Client.getClient();

    interval = setInterval(() => {
      this.connected = client.connected;

      const channelId = client._channelId;
      if ( channelId != null && this.connected === true ) {
        twitch.getStreamInfo(channelId)
          .then((stream) => this.setStreamInfo(stream));
      }
      else {
        this.setStreamInfo(null);
      }
    }, 1500);
  },
  destroyed() {
    if ( interval != null ) {
      clearInterval(interval);
      interval = null;
    }
  }
}
</script>