<!--
  Template
-->
<template lang="jade">
div#modulesPanel.gallery-curve-wrapper
  div.gallery-header
    span Module Manager
    p.caption Find, install, and remove WonderTools modules.
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
                  span.small By {{ module.author }}
                div {{ module.description }}
              td {{ `v${module.version}` }}
              td {{ getUpdated(module.updated) }}
              td
                a.btn.light-blue.darken-2.waves-effect.waves-light(href="javascript:void(0);", @click="downloadModule(module.name, module.url)"
                    v-if="!isModuleInstalled(module.name)", :class="{ disabled: isModuleDownloading(module.name) }") 
                  span(v-if="isModuleDownloading(module.name)") Installing
                  span(v-else) Install
                a.btn.orange.waves-effect.waves-light(href="javascript:void(0);", v-else-if="isModuleUpdated(module.name, module.version)", 
                    @click="downloadModule(module.name, module.url, true)", :class="{ disabled: isModuleDownloading(module.name) }")
                  span(v-if="isModuleDownloading(module.name)") Updating
                  span(v-else) Update
                a.btn.red.waves-effect.waves-light(href="javascript:void(0);", v-else, @click="uninstallModule(module.name)") Uninstall

</template>

<!-- 
  Style
-->
<style scoped lang="less">
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
      activeDownloads: []
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
      github.getRemoteModules()
        .then((modules) => this.modules = modules);
    },
    getUpdated(when) {
      return moment(when).fromNow();
    },
    isModuleInstalled(name) {
      return moduleStore._modules[name] != null;
    },
    isModuleDownloading(name) {
      return this.activeDownloads.some(m => m === name);
    },
    isModuleUpdated(name, version) {
      const module = moduleStore._modules[name];
      return semver.gt(version, module._moduleVersion);
    },
    openUrl(url) {
      shell.openExternal(url);
    },
    uninstallModule(name) {
      moduleStore._removeModule(name)
        .then(() => moduleStore.unload())
        .then(() => moduleStore.load())
        .then(() => {
            this.$nextTick(() => {
              this.$emit('modules-changed');
              this.$forceUpdate();
          });
        });
    },
    downloadModule(name, baseUrl, update) {
      if ( this.isModuleDownloading(name) ) return;

      const savePath = join(remote.app.getPath('userData'), 'modules', `${ name }.zip`);
      this.activeDownloads.push(name);

      let promise = Promise.resolve();
      if ( update === true ) {
        promise = moduleStore._removeModule(name);
      }

      promise.then(() => github.downloadArchive(baseUrl, savePath))
        .then((zipPath) => moduleStore._extractModule(zipPath))
        .then((zipPath) => unlinkSync(zipPath))
        .then(() => moduleStore.unload())
        .then(() => moduleStore.load())
        .then(() => {
          this.$nextTick(() => {
            this.activeDownloads = this.activeDownloads.filter(m => m !== name);
            this.$emit('modules-changed');
          });
        });
    }
  }
}
</script>