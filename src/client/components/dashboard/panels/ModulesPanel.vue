<!--
  Template
-->
<template lang="jade">
div#modulesPanel.gallery-curve-wrapper
  div.gallery-header
    span Module Manager
    p.caption 
      | Find, install, and remove WonderTools modules.
      span.small(v-if="updateCount > 0")
        span.orange-text {{ updateCount }}
        span(v-if="updateCount === 1") &nbsp;update available!
        span(v-if="updateCount > 1") &nbsp;updates available!

  div.gallery-body
    div.title-wrapper
      h4 Module Manager
    div.content(v-if="isActive")
      div.row(style="margin-bottom: 0px;")

      div.row
        table.striped.responsive-table
          thead: tr
            td Module
            td Version
            td Last Updated
            td Manage
          tbody
            tr(v-for="module in modules")
              td
                div.title 
                  a(href="#", @click="openUrl(module.url)") {{ module.name }}
                  span.small By {{ module.author || 'Unknown' }}
                div {{ module.description }}
              td 
                span(v-if="module.updateVersion == null") {{ `v${module.version}` }}
                span.orange-text(v-else) {{ `v${module.updateVersion}` }}
              td {{ getUpdated(module.updated) }}
              td
                a.btn.waves-effect.waves-light.install(href="javascript:void(0);", @click="downloadModule(module)"
                    v-if="module.isLocal !== true", :class="{ disabled: module.isInstalling === true || module.url == null }") 
                  span(v-if="module.isInstalling === true") Installing
                  span(v-else) Install
                a.btn.waves-effect.waves-light(href="javascript:void(0);", v-else-if="module.hasUpdate === true", 
                    @click="downloadModule(module, true)", :class="{ disabled: module.isInstalling === true || module.url == null }")
                  span(v-if="module.isInstalling === true") Updating
                  span(v-else) Update
                a.btn.red.waves-effect.waves-light(href="javascript:void(0);", v-else, @click="uninstallModule(module)") Uninstall

</template>

<!-- 
  Style
-->
<style scoped lang="less">
a.install {
  background-color: #005C94 !important;
}

p.caption {
  span.small {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
}
td {
  text-align: center;

  div.title {
    font-weight: bold;

    .small {
      font-weight: normal;
      font-size: 0.8rem;
      color: #757575;
      margin-left: 0.6rem;
    }
  }
  > a.btn {
    width: 97%;
  }

  &:first-child {
    text-align: left;
  }
}
</style>

<!--
  Script
-->
<script>
import { shell, remote } from 'electron';
import { unlinkSync } from 'fs';
import { join } from 'path';

import semver from 'semver';
import moment from 'moment';

import * as github from '../../../../api/github';
import moduleStore from '../../../../bot/core/module/moduleStore';

export default {
  props: [ 'isActive' ],
  data() {
    return {
      modules: [],
      updateCount: 0
    }
  },
  watch: {
    isActive() {
      if ( this.isActive !== true ) return;

      this.loadModules();
    }
  },
  methods: {
    loadModules() {
      return github.getRemoteModules()
        .then((remoteModules) => {
          let allModules = remoteModules;

          // Get local modules
          moduleStore._localModules.forEach((module) => {
            module.isLocal = true;

            const found = remoteModules.find(m => m.name === module.name);
            if ( found != null ) {
              module.url = found.url;
              allModules = allModules.filter(m => m.name !== module.name);

              if ( semver.gt(found.version, module.version) ) {
                module.updateVersion = found.version;
                module.hasUpdate = true;
              }
            }

            allModules.push(module);
          });

          this.modules = allModules;

          return allModules;
        });
    },
    getUpdated(when) {
      if ( when == null ) {
        return 'Unknown';
      }

      return moment(when).fromNow();
    },
    openUrl(url) {
      shell.openExternal(url);
    },
    uninstallModule(remoteModule) {
      moduleStore._removeModule(remoteModule.name)
        .then(() => {
            this.$nextTick(() => {
              remoteModule.isInstalling = false;
              remoteModule.isLocal = false;

              this.$emit('modules-changed');
              this.$forceUpdate();
          });
        });
    },
    downloadModule(remoteModule, update) {
      const name = remoteModule.name;
      const baseUrl = remoteModule.url;

      if ( remoteModule.isInstalling === true || baseUrl == null ) return;

      remoteModule.isInstalling = true;
      this.$forceUpdate();
      const savePath = join(remote.app.getPath('userData'), 'modules', `${ name }.zip`);

      let promise = Promise.resolve();
      if ( update === true ) {
        promise = moduleStore._removeModule(name);
      }

      promise.then(() => github.downloadArchive(baseUrl, savePath))
        .then((zipPath) => moduleStore._installModule(remoteModule, zipPath))
        .then(() => unlinkSync(savePath))
        .then(() => {
          this.$nextTick(() => {
            remoteModule.isInstalling = false;
            remoteModule.isLocal = true;
            if ( update === true ) {
              remoteModule.version = remoteModule.updateVersion;
              remoteModule.updateVersion = null;
              remoteModule.hasUpdate = false;
            }

            this.$emit('modules-changed');
            this.$forceUpdate();
          });
        });
    }
  },
  mounted() {
    this.loadModules()
      .then((modules) => {
        this.updateCount = modules.filter(m => m.hasUpdate === true).length;
      });
  }
}
</script>