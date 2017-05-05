import path from 'path';
import fs from 'fs';

import Vue from 'vue/dist/vue';
import glob from 'glob';

import moduleStore from '../../../bot/core/module/moduleStore';
import { getPanelTemplate } from './emptyPanel';

// -----
//  Helpers
// -----

// getComponentMixin()
const getComponentMixin = function getComponentMixin(panel) {
  return {
    data() {
      let data = {
        title: panel.panelName,
        description: `Configuration options for ${ panel.panelName }`,
        commands: panel.module._commands,
        variables: panel.module._variables
      };

      if ( typeof(this.__panelData) === 'function' ) {
        data = Object.assign(data, this.__panelData());
      }

      return data;
    }
  }
}; //- getComponentMixin()

// createComponent()
const createComponent = function createComponent(panel) {
  const moduleName = panel.module._moduleName;
  const moduleRoot = panel.module._moduleRoot;

  const componentName = `${ moduleName }${ panel.panelName }`;

  const template = fs.readFileSync(path.join(moduleRoot, 'ui', 'panels', panel.template), 'utf8');
  const templateString = getPanelTemplate(template);

  const compDef = require(path.join(moduleRoot, 'ui', 'panels', panel.script), 'utf8');

  // Copy data, if it exists
  if ( typeof(compDef.data) === 'function' ) {
    if ( compDef.methods == null ) {
      compDef.methods = {};
    }

    compDef.methods.__panelData = compDef.data;
    delete compDef['data'];
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
      try {
        const panelConfig = require(path.join(module._moduleRoot, 'ui', 'panels', 'panels.json'));
        return Object.keys(panelConfig)
          .map((key) => {
            const value = panelConfig[key];

            value.panelName = key;
            value.module = module;

            return value;
          });
      }
      catch ( err ) {
        throw err;
      }
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