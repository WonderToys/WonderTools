import path from 'path';
import fs from 'fs';
import vm from 'vm';
import util from 'util';
import { remote } from 'electron';
import glob from 'glob';

import providerStore from './providerStore';
import Module from './Module';
import { Command } from '../command/Command';
import Viewer from '../viewer/Viewer';

import { getSandbox } from './sandbox';

// -----
//  ModuleStore
// -----

class ModuleStore {
  constructor() {
    this._modules = {};

    this._populateStandardProviders();
  }

  // -----
  //  Private
  // -----

  _populateStandardProviders() {
    providerStore.register('$Module', Module);
    providerStore.register('$Command', Command);
    providerStore.register('$Viewer', Viewer);
  }

  _loadModule(manifest, moduleRoot) {
    const entryPath = path.normalize(path.join(moduleRoot, manifest.entry));
    const sandbox = getSandbox(entryPath, manifest.consumes);

    return new Promise((resolve, reject) => {
      fs.readFile(entryPath, 'utf8', (err, data) => {
        vm.runInContext(data, sandbox);
        let exported = sandbox.module.exports;

        // Register the module
        if (exported.prototype instanceof Module) {
          this._modules[manifest.name] = new exported();
        }

        // Register commands
        // Register variables

        resolve();
      });
    });
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
};

// Exports
export default new ModuleStore();