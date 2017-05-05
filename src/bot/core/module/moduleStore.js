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

const WT_PROVIDER_REGEX = /^(wtools\/)/i;

// -----
//  Monkeypatch
// -----

const originalResolve = NodeModule._resolveFilename;

NodeModule._resolveFilename = function patchedResolveFilename(request, parent, isMain) {
  if ( WT_PROVIDER_REGEX.test(request) === true) {
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
    NodeModule._cache['wtools/Module'] = { exports: Module };
    NodeModule._cache['wtools/Viewer'] = { exports: Viewer };
    NodeModule._cache['wtools/Variable'] = { exports: Variable };
    NodeModule._cache['wtools/Command'] = { exports: Command };
    NodeModule._cache['wtools/Persistable'] = { exports: Persistable };
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
        modInstance._commands = [];
        modInstance._variables = [];
        modInstance._providers = [];

        this._modules[manifest.name] = modInstance;
        return this._loadProviders(modInstance, manifest.name)
          .then(() => this._loadCommands(modInstance))
          .then(() => this._loadVariables(modInstance));
      });
  }

  _loadProviders(module, moduleName) {
    const moduleRoot = module._moduleRoot;
    const searchGlob = path.join(moduleRoot, 'providers', '**', '*.js');

    return new Promise((resolve, reject) => {
      glob(searchGlob, (err, files) => {
        if ( err != null ) throw err;

        const promises = files.map((file) => {
          const providerName = path.basename(file, '.js');
          const cacheKey = `wtools/${ moduleName }/${ providerName }`;

          try {
            const provider = require(file);
            module._providers.push(provider);
            NodeModule._cache[cacheKey] = { exports: provider };
            
            return provider;
          }
          catch ( e ) {
            throw e;
          }
        });

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  _loadCommands(module) {
    const moduleRoot = module._moduleRoot;
    const searchGlob = path.join(moduleRoot, 'commands', '**', '*Command.js');

    return new Promise((resolve, reject) => {
      glob(searchGlob, (err, files) => {
        if ( err != null ) throw err;

        const promises = files.map((file) => {
          try {
            const cmdClass = require(file);
            if ( !(cmdClass.prototype instanceof Command) ) {
              throw new Error(`${ file } does not export a Command!`);
            }

            const cmdInstance = new cmdClass();
            module._commands.push(cmdInstance);

            return commandStore._register(cmdInstance);
          }
          catch ( e ) {
            throw e;
          }
        });

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  _loadVariables(module) {
    const moduleRoot = module._moduleRoot;
    const searchGlob = path.join(moduleRoot, 'variables', '**', '*Variable.js');

    return new Promise((resolve, reject) => {
      glob(searchGlob, (err, files) => {
        if ( err != null ) throw err;

        const promises = files.map((file) => {
          try {
            const varClass = require(file);
            if ( !(varClass.prototype instanceof Variable) ) {
              throw new Error(`${ file } does not export a Variable!`);
            }

            const varInstance = new varClass();
            module._variables.push(varInstance);

            return variableStore._register(varInstance);
          }
          catch ( e ) {
            throw e;
          }
        });

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  // -----
  //  Public
  // -----

  load(force) {
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
    Object.values(this._modules)
      .forEach((module) => {
        if ( typeof(module.unload) === 'function' ) {
          module.unload();
        }
      });

    this._modules = {};
  }

  notify(event, args) {
    const promises = Object.values(this._modules)
      .map((module) => {
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