import path from 'path';
import { remote } from 'electron';
import glob from 'glob';
import fs from 'fs';
import vm from 'vm';

import providerStore from './providerStore';

import Module from './Module';
import Viewer from '../viewer/Viewer';
import Variable from '../variable/Variable';
import { Command } from '../command/Command';

// -----
//  Fields
// -----

const WT_STANDARD_REGEX = /^(\$\w+\b)/i;
const WT_PROVIDER_REGEX = /^(wondertools\/)/i;

// -----
//  Patch Require
// -----

// patchedRequire()
const patchedRequire = function patchedRequire(module) {
  if ( WT_STANDARD_REGEX.test(module) ) {
    return providerStore.get(module);
  }

  if ( WT_PROVIDER_REGEX.test(module) === true ) {
    module = module.replace(WT_PROVIDER_REGEX, '');
    return providerStore.get(module);
  }

  return require(module);
}; //- patchedRequire()

// -----
//  ModuleStore
// -----

class ModuleStore {
  constructor() {
    this._modules = {};

    this._registerStandardProviders();
  }

  // -----
  //  Private
  // -----

  _registerStandardProviders() {
    providerStore.register('$Module', Module);
    providerStore.register('$Viewer', Viewer);
    providerStore.register('$Variable', Variable);
    providerStore.register('$Command', Command);
  }

  _loadFileWithPatchedRequire(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, 'utf8', (err, data) => {
        if ( err != null ) return reject(err);

        const script = `
          (function(require, __dirname, __filename) { 
            ${data} 

            if ( module.exports == null ) {
              return new Error('No module.exports found!');
            }

            return module.exports;
          })`;

        try {
          const res = vm.runInThisContext(script, { filename });
          const module = res(patchedRequire, path.dirname(filename), filename);

          if ( module instanceof Error ) {
            return reject(module);
          }

          resolve(module);
        }
        catch ( err ) {
          reject(err);
        }
      });
    });
  }

  _loadModule(manifest, moduleRoot) {
    const entryPath = path.normalize(path.join(moduleRoot, manifest.entry));

    return this._loadFileWithPatchedRequire(entryPath)
      .then((module) => {
        module._moduleName = manifest.name;
        module._moduleRoot = moduleRoot;

        this._modules[manifest.name] = module;
        return this._loadProviders(module);
      });
  }

  _loadProviders(module) {
    const providers = module.providers || {};
    const moduleRoot = module._moduleRoot;

    const promises = Object.keys(providers)
      .map((key) => {
        const providerPath = path.normalize(path.join(moduleRoot, providers[key]));

        return this._loadFileWithPatchedRequire(providerPath)
          .then((provider) => {
            provider._providerName = key;
            provider._providerPath = providerPath;

            providerStore.register(key, provider);
            return provider;
          });
      });

    return Promise.all(promises);
  }

  // -----
  //  Public
  // -----

  load() {
    const modulePath = path.join(remote.app.getAppPath(), 'modules');

    return new Promise((resolve, reject) => {
      glob(`${ modulePath }/**/module.json`, (err, files) => {
        if ( err != null ) {
          return reject(err);
        }
        
        const promises = files.map((file) => {
          const manifest = require(file);
          const moduleRoot = path.dirname(file);
          return this._loadModule(manifest, moduleRoot);
        });

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  notify(event, args) {
    const promises = Object.keys(this._modules)
      .map((key) => {
        const module = this._modules[key];
        if ( typeof(module[event]) === 'function' ) {
          return module[event](args);
        }

        return Promise.resolve(true);
      });

    return Promise.all(promises);
  }
};

// Exports
export default new ModuleStore();