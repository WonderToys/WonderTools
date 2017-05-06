import path from 'path';
import fs from 'fs';

import Vue from 'vue/dist/vue';
import glob from 'glob';

import moduleStore from '../../../bot/core/module/moduleStore';
import { getPanelTemplate } from './emptyPanel';

import CommandEditor from '../commandEditor/CommandEditor.vue';

// -----
//  Helpers
// -----

// getComponentMixin()
const getComponentMixin = function getComponentMixin(panel) {
  return {
    components: {
      CommandEditor
    },
    props: [ 'isActive' ],
    data() {
      let data = {
        title: panel.panelName,
        description: `Configuration options for ${ panel.panelName }`,
        commands: panel.module._commands,
        variables: panel.module._variables,
        extensions: getExtensions(`${ panel.module._moduleName }/${ panel.panelName }`)
      };

      if ( typeof(this.__panelData) === 'function' ) {
        data = Object.assign(data, this.__panelData());
      }

      return data;
    },
    watch: {
      isActive() {
        if ( this.isActive !== true ) return;

        if ( typeof(this.__panelMounted) === 'function' ) {
          this.__panelMounted();
        }
      }
    }
  }
}; //- getComponentMixin()

// createComponent()
const createComponent = function createComponent(panel) {
  const moduleName = panel.module._moduleName;
  const moduleRoot = panel.module._moduleRoot;

  const componentName = `${ moduleName }${ panel.panelName }`;

  const template = fs.readFileSync(path.join(moduleRoot, panel.template), 'utf8');
  const templateString = getPanelTemplate(template);

  const compDef = require(path.join(moduleRoot, panel.script), 'utf8');

  // Copy data, if it exists
  if ( typeof(compDef.data) === 'function' ) {
    if ( compDef.methods == null ) {
      compDef.methods = {};
    }

    compDef.methods.__panelData = compDef.data;
    delete compDef['data'];

    compDef.methods.__panelMounted = compDef.mounted;
    delete compDef['mounted'];
  }

  compDef.mixins = [ getComponentMixin(panel) ];
  compDef.template = templateString;

  const component = Vue.component(componentName, compDef);

  return componentName;
}; //- createComponent()

// -----
//  Exports
// -----

// loadPanels()
export const loadPanels = function loadPanels() {
  const promises = Object.values(moduleStore._modules)
    .map((module) => {
      const panelConfig = module._ui.panels;
      return Object.keys(panelConfig)
        .map((key) => {
          const value = panelConfig[key];

          value.panelName = key;
          value.module = module;

          return value;
        });
    });

  return Promise.all(promises)
    .then((toFlatten) => {
      return toFlatten.reduce((acc, item) => {
        return acc.concat(item);
      }, []);
    })
    .then((panels) => {
      return Promise.all(panels.map((p) => {
        return createComponent(p);
      }));
    });
}; //- loadPanels();

// getExtensions()
export const getExtensions = function getExtensions(name) {
  const keys = Object.keys(moduleStore._modules);

  return keys.map((moduleName) => {
    const module = moduleStore._modules[moduleName];
    const extensions = module._ui.extensions;

    const found = Object.keys(extensions).filter(e => e === name);
    if ( found == null ) return [];

    return found.map(key => {
      return require(path.join(module._moduleRoot, extensions[key]));
    });
  }).reduce((acc, item) => acc.concat(item), []);
}; //- getExtensions()