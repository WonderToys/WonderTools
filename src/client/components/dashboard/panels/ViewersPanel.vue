<!--
  Template
-->
<template lang="jade">
div.gallery-curve-wrapper
  div.gallery-header
    span Viewers
    p.caption Set regulars, ban and unban, timeout viewers, and see viewer history. 
  div.gallery-body
    div.title-wrapper
      h4 Viewers
    div.content
      table.striped.responsive-table
        thead: tr
          td Name
          td Mod
          td Sub
          td Follows
          td Last Seen
        tbody
          tr(v-for="viewer in viewers", :class="{ 'purple lighten-5 bold': viewer.isBroadcaster }")
            td {{ viewer.displayName || viewer.username }}
            td {{ viewer.isModerator }}
            td {{ viewer.isSubscriber }}
            td {{ viewer.isFollower || '??' }}
            td {{ viewer.lastSeenFromNow || 'N/A' }}

</template>

<!--
  Style
-->
<style scoped lang="less">
div.content {
  tr.bold {
    font-weight: 500;
  }
}
</style>

<!--
  Script
-->
<script>
import moment from 'moment';

import Viewer from '../../../../bot/core/viewer/Viewer';

export default {
  data() {
    return {
      viewers: []
    }
  },
  methods: {
    loadViewers() {
      var sort = [ '-isBroadcaster', '-isModerator', '-isSubscriber', '-isFollower', 'displayName', 'username' ];
      Viewer.find({}, { sort })
        .then((docs) => {
          this.viewers = docs.map((v) => {
            if ( v.lastSeen != null ) {
              v.lastSeenFromNow = moment(v.lastSeen).fromNow();
            }

            return v;
          });
        });
    }
  },
  updated() {
    this.loadViewers();
  },
  mounted() {
    this.loadViewers();
  }
}
</script>