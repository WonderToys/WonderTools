<!--
  Template
-->
<template lang="jade">
div.app-container
  div#main
    dashboard

  app-bar

  //- Release Notes Modal
  div#releaseNotesModal.modal.modal-fixed-footer
    div.modal-content
      h5(style="margin-top: 0px;") What's New (v{{ version }})
      include releaseNotes.jade
    div.modal-footer
      a.modal-action.modal-close.waves-effect.waves-blue.btn-flat(href="javascript:void(0);") Close
</template>

<!-- 
  Style
-->
<style lang="less">
@import 'app';

#releaseNotesModal {
  h5 {
    color: #005C94;
  }

  #releaseNotesList {
    > li {
      font-weight: bold;
      font-size: 1.2rem;
      margin-top: 1rem;

      > ul {
        font-size: 1.0rem;
        font-weight: normal;

        li {
          &:before {
            display: inline-block;
            content: "-";
            width: 0.7rem;
          }
        }
      }

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>

<!-- 
  Script
-->
<script>
import { remote } from 'electron';
import semver from 'semver';

import Dashboard from './components/dashboard/Dashboard.vue';
import AppBar from './components/appBar/AppBar.vue';

export default {
  components: { Dashboard, AppBar },
  data() {
    return {
      version: remote.app.getVersion()
    }
  },
  mounted() {
    $('#releaseNotesModal').modal();

    const ver = localStorage.getItem('currentVersion');
    if ( ver != null && semver.gt(remote.app.getVersion(), ver) ) {
      $('#releaseNotesModal').modal('open');
    }

    localStorage.setItem('currentVersion', remote.app.getVersion());
  }
}
</script>