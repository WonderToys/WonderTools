<!--
  Template
-->
<template lang="jade">
div#viewersPanel.gallery-curve-wrapper
  div.gallery-header
    span Viewers
    p.caption View and manage stream viewers.
  div.gallery-body
    div.title-wrapper
      h4 Viewers
    div.content(v-if="isActive")
      div.row(style="margin-bottom: 0px;")
        div(style="display: inline-block; line-height: 59px;")
          em Showing viewers {{ startItem }}-{{ endItem }} of {{ viewersCount }}
        div.right(v-if="viewersCount > 50")
          pagination(:page="1", :total-items="viewersCount", :per-page="50", @page-changed="onPageChanged")
      div.row
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

import Pagination from '../../pagination/Pagination.vue';

import { getExtensions } from '../../panelLoader/panelLoader';
import Viewer from '../../../../bot/core/viewer/Viewer';

export default {
  components: {
    Pagination
  },
  props: [ 'isActive' ],
  data() {
    return {
      viewers: [],
      viewersCount: 0,
      addExtensions: [],
      addExValues: {},
      currentPage: 1,
      startItem: 0,
      endItem: 50
    }
  },
  watch: {
    isActive() {
      if ( this.isActive !== true ) return;

      this.addExtensions = getExtensions('$ViewersPanel')
        .filter(ex => ex.add != null)
        .map(ex => ex.add);

      this.getViewerCount();
    }
  },
  methods: {
    onPageChanged(newPage, oldPage) {
      this.currentPage = newPage;
      this.loadViewers();
    },
    loadViewers() {
      var sort = [ '-isBroadcaster', '-isModerator', '-isSubscriber', '-isFollower', 'displayName', 'username' ];

      if ( this.currentPage === 1 ) {
        if ( this.viewersCount > 0 ) this.startItem = 1;
        if ( this.viewersCount === 0 ) this.startItem = 0;
      }
      else {
        this.startItem = ((this.currentPage - 1) * 50) + 1;
      }

      this.endItem = this.startItem + 49;
      if ( this.endItem > this.viewersCount ) this.endItem = this.viewersCount;

      Viewer.find({}, { 
          limit: 50,
          skip: (this.startItem - 1),
          sort 
        })
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
    getViewerCount() {
      Viewer.count({})
        .then((count) => this.viewersCount = count)
        .then(() => this.loadViewers());
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