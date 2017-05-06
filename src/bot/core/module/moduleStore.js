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

import { addPath as addRequirePath } from 'app-module-path';

// -----
//  Fields
// -----

const WT_PROVIDER_REGEX = /^(wtools\/)/i;

// -----
//  Monkeypatch
// -----

if ( process.env === 'production' ) {
  addRequirePath(path.join(remote.app.getAppPath(), 'resources', 'app.asar', 'app', 'node_modules'));
  addRequirePath(path.join(remote.app.getAppPath(), 'resources', 'app.asar', 'node_modules'));
}
else {
  addRequirePath(path.join(__dirname, '../', 'node_modules'));
}

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

        modInstance._ui = manifest.ui || {
          panels: {},
          extensions: {}
        };

        modInstance._commands = [];
        modInstance._variables = [];
        modInstance._providers = [];

        this._modules[manifest.name] = modInstance;
        return this._loadProviders(modInstance, manifest.providers)
          .then(() => this._loadCommands(modInstance, manifest.commands))
          .then(() => this._loadVariables(modInstance, manifest.variables));
      });
  }

  _loadProviders(module, providers) {
    const moduleRoot = module._moduleRoot;
    const moduleName = module._moduleName;

    const promises = providers.map((ppath) => {
      const providerPath = path.join(moduleRoot, ppath);
      const providerName = path.basename(ppath, path.extname(ppath));
      const cacheKey = `wtools/${ moduleName }/${ providerName }`;

      try {
        const provider = require(providerPath);
        module._providers.push(provider);
        NodeModule._cache[cacheKey] = { exports: provider };
        
        return provider;
      }
      catch ( e ) {
        throw e;
      }
    });

    return Promise.all(promises);
  }

  _loadCommands(module, commands) {
    const moduleRoot = module._moduleRoot;
    const moduleName = module._moduleName;

    const promises = commands.map((cpath) => {
      const commandPath = path.join(moduleRoot, cpath);

      try {
        const cmdClass = require(commandPath);
        if ( !(cmdClass.prototype instanceof Command) ) {
          throw new Error(`${ file } does not export a Command!`);
        }

        const cmdInstance = new cmdClass();
        cmdInstance._moduleName = moduleName;
        cmdInstance._commandPath = commandPath;

        module._commands.push(cmdInstance);

        return commandStore._register(cmdInstance);
      }
      catch ( e ) {
        throw e;
      }
    });

    return Promise.all(promises);
  }

  _loadVariables(module, variables) {
    const moduleRoot = module._moduleRoot;
    const moduleName = module._moduleName;

    const promises = variables.map((vpath) => {
      const variablePath = path.join(moduleRoot, vpath);

      try {
        const varClass = require(variablePath);
        if ( !(varClass.prototype instanceof Variable) ) {
          throw new Error(`${ file } does not export a Variable!`);
        }

        const varInstance = new varClass();
        varInstance._moduleName = moduleName;
        varInstance._variablePath = variablePath;
        
        module._variables.push(varInstance);

        return variableStore._register(varInstance);
      }
      catch ( e ) {
        throw e;
      }
    });

    return Promise.all(promises);
  }

  // -----
  //  Public
  // -----

  load(force) {
    this._modules = {};
    
    const modulePath = path.join(remote.app.getPath('userData'), 'modules');
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