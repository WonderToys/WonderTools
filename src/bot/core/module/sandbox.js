import vm from 'vm';
import path from 'path';

import providerStore from './providerStore';

// getSandbox()
export const getSandbox = function getSandbox(filePath, permissions) {
  permissions = permissions || {};

  const originalRequire = require;

  // sandboxRequire()
  const sandboxRequire = function sandboxRequire(module) {
    if ( module === '$Module' ) {
      return providerStore.get('$Module');
    }

    if ( permissions.indexOf(module) >= 0 ) {
      return providerStore.get(module);
    }

    return null;
  }; //- sandboxRequire()

  const sandbox = {
    __dirname: path.dirname(filePath),
    __filename: filePath,

    module: {},
    setTimeout, setInterval,

    require: sandboxRequire,
  };

  return vm.createContext(sandbox);
}; //- getSandbox()