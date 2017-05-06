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
    div.content(v-if="isActive")
      table.striped.responsive-table
        thead: tr
          td Name
          td Mod
          td Sub
          td Follower
          td(v-for="ex in addExtensions", style="max-width: 6rem;")
            | {{ ex.title }}
          td Last Seen
        tbody
          tr(v-for="viewer in viewers", :class="{ 'purple lighten-5 bold': viewer.isBroadcaster }")
            td {{ viewer.displayName || viewer.username }}
            td 
              input.filled-in(:id="`moderator_${ viewer._id }`", type="checkbox", v-model="viewer.isModerator", disabled, :indeterminate.prop="viewer.isSubscriber == null")
              label(:for="`moderator_${ viewer._id }`")
            td 
              input(:id="`subscriber_${ viewer._id }`", type="checkbox", v-model="viewer.isSubscriber", 
                @change="viewer.save()", :indeterminate.prop="viewer.isSubscriber == null", :class="{ 'filled-in': viewer.isSubscriber != null }")
              label(:for="`subscriber_${ viewer._id }`")
            td 
              input(:id="`follower_${ viewer._id }`", type="checkbox", v-model="viewer.isFollower", 
                @change="viewer.save()", :indeterminate.prop="viewer.isFollower == null", :class="{ 'filled-in': viewer.isFollower != null }")
              label(:for="`follower_${ viewer._id }`")
            td(v-for="(ex, index) in addExtensions", v-html="getExtensionValue(index, viewer._id)", style="max-width: 6rem;")
            td {{ viewer.lastSeenFromNow || 'N/A' }}

</template>

<!--
  Style
-->
<style scoped lang="less">
td {
  text-align: center;

  &:first-child {
    text-align: left;
  }
}
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

import { getExtensions } from '../../panelLoader/panelLoader';
import Viewer from '../../../../bot/core/viewer/Viewer';

export default {
  props: [ 'isActive' ],
  data() {
    return {
      viewers: [],
      addExtensions: [],
      addExValues: {}
    }
  },
  watch: {
    isActive() {
      if ( this.isActive !== true ) return;

      this.addExtensions = getExtensions('$ViewersPanel')
        .filter(ex => ex.add != null)
        .map(ex => ex.add);

      this.loadViewers();
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

            // Get extension values
            this.addExtensions.forEach((ex, index) => {
              if ( this.addExValues[index] == null ) this.addExValues[index] = {};

              if ( typeof(ex.value) === 'function' ) {
                let value = ex.value(v);
                if ( !(value instanceof Promise) ) {
                  value = Promise.resolve(value);
                }

                value.then((val) => {
                  this.addExValues[index][v._id] = val
                  this.$forceUpdate();
                });
              }
              else {
                this.addExValues[index][v._id] = value;
              }
            }); //- Get extension values

            return v;
          });
        });
    },
    getExtensionValue(index, viewerId) {
      if ( this.addExValues[index] == null ) {
        return '';
      }

      return this.addExValues[index][viewerId];
    }
  }
}
</script>