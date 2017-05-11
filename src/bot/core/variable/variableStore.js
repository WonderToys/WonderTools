import Variable from './Variable';

import builtInVariables from '../builtIn/variables/index';

// -----
//  Fields
// -----

const FULL_VARIABLE_REGEX = /(\$\w+)((?=[^(]|\s|$)|(\(([^)]*)\)(?=\s|$)))/gi;
const VARIABLE_NAME_REGEX = /(\$\w+)/i;

// -----
//  Helpers
// -----

// _variableNamesMatch()
const _variableNamesMatch = function _variableNamesMatch(a, b) {
  if ( a instanceof RegExp ) {
    return a.test(b);
  }

  return a === b;
}; //- _variableNamesMatch()

// -----
//  VariableStore
// -----

class VariableStore {
  constructor() {
    this._variables = [];
  }

  // -----
  //  Private
  // -----

  _register(variable) {
    if ( variable == null ) {
      throw new Error('Variable not provided!');
    }

    if ( typeof(variable.name) === 'string' ) {
      if ( variable.name == null || variable.name.length === 0 || variable.name.indexOf(' ') >= 0 ) {
        throw new Error('The variable must have a name that does not contain spaces!');
      }
    }
    else if ( !(variable.name instanceof RegExp) ) {
      throw new Error('The variable must have a name that does not contain spaces!');
    }

    this._variables = this._variables.filter(v => !_variableNamesMatch(v.name, variable.name));
    this._variables.push(variable);

    return variable;
  }

  // -----
  //  Public
  // -----

  getOne(name) {
    return this._variables.find((v) => {
      return _variableNamesMatch(v.name, name);
    });
  }

  load() {
    this._variables = [];

    const promises = [];

    // Add built-in variables
    promises.concat(builtInVariables.map((v) => {
      v.__isOfficial = true;

      return this._register(v);
    }));

    return Promise.all(promises);
  }

  unload() {
    this._variables.forEach((variable) => {
      if ( typeof(variable.unload) === 'function' ) {
        variable.unload();
      }
    });

    this._variables = [];
  }
};

// Exports
export default new VariableStore();