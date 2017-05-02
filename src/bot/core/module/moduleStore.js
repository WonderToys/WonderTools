import path from 'path';
import { remote } from 'electron';
import glob from 'glob';
import NodeModule from 'module';

import commandStore from '../command/commandStore';
import variableStore from '../variable/variableStore';

import Module from './Module';
import Viewer from '../viewer/Viewer';
import Variable from '../variable/Variable';
import Persistable from '../../Persistable';
import { Command } from '../command/Command';

// -----
//  Fields
// -----

const WT_STANDARD_REGEX = /^(\$\w+\b)/i;
const WT_PROVIDER_REGEX = /^(wondertools\/)/i;

// -----
//  Monkeypatch
// -----

const originalResolve = NodeModule._resolveFilename;

NodeModule._resolveFilename = function patchedResolveFilename(request, parent, isMain) {
  if ( WT_STANDARD_REGEX.test(request) || WT_PROVIDER_REGEX.test(request) === true) {
    return request;
  }

  return originalResolve(request, parent, isMain);
};

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
    NodeModule._cache['$Module'] = { exports: Module };
    NodeModule._cache['$Viewer'] = { exports: Viewer };
    NodeModule._cache['$Variable'] = { exports: Variable };
    NodeModule._cache['$Command'] = { exports: Command };
    NodeModule._cache['$Persistable'] = { exports: Persistable };
  }

  _loadFileWithPatchedRequire(filename) {
    return new Promise((resolve, reject) => {
      try {
        const module = require(filename);
        resolve(module);
      }
      catch ( err ) {
        reject(err);
      }
    });
  }

  _loadModule(manifest, moduleRoot) {
    const entryPath = path.normalize(path.join(moduleRoot, manifest.entry));

    return this._loadFileWithPatchedRequire(entryPath)
      .then((module) => {
        if ( !(module.prototype instanceof Module) ) {
          throw new Error(`${ manifest.name } is not a Module!`);
        }

        const modInstance = new module();
        modInstance._moduleName = manifest.name;
        modInstance._moduleRoot = moduleRoot;

        this._modules[manifest.name] = modInstance;
        return this._loadProviders(modInstance)
          .then(() => this._loadCommands(modInstance))
          .then(() => this._loadVariables(modInstance));
      });
  }

  _loadProviders(module) {
    const providers = module.providers || {};
    const moduleRoot = module._moduleRoot;

    const promises = Object.keys(providers)
      .map((key) => {
        if ( typeof(providers[key]) === 'string' ) {
          const providerPath = path.normalize(path.join(moduleRoot, providers[key]));

          return this._loadFileWithPatchedRequire(providerPath)
            .then((provider) => {
              provider._providerName = key;
              provider._providerPath = providerPath;

              NodeModule._cache[`wondertools/${ key }`] = { exports: provider };
              return provider;
            });
        }

        const provider = providers[key];
        provider._providerName = key;

        NodeModule._cache[`wondertools/${ key }`] = { exports: provider };
        return Promise.resolve(provider);
      });

    return Promise.all(promises);
  }

  _loadCommands(module) {
    const commands = module.commands || [];
    const moduleRoot = module._moduleRoot;

    const promises = commands.map((command) => {
      if ( command instanceof Command ) {
        return commandStore._register(command);
      }

      return commandStore._register(new command());
    });

    return Promise.all(promises);
  }

  _loadVariables(module) {
    const variables = module.variables || [];
    const moduleRoot = module._moduleRoot;

    const promises = variables.map((variable) => {
      if ( variable instanceof Variable ) {
        return variableStore._register(variable);
      }

      return variableStore._register(new variable());
    });

    return Promise.all(promises); 
  }

  // -----
  //  Public
  // -----

  load() {
    this._modules = {};
    
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

  unload() {
    const keys = Object.keys(this._modules);
    keys.forEach((key) => {
      const module = this._modules[key];
      if ( typeof(module.unload) === 'function' ) {
        module.unload();
      }
    });

    this._modules = {};
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