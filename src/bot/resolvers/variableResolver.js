import variableStore from '../core/variable/variableStore';

// -----
//  Fields
// -----

const VARIABLE_REGEX = /(\$\w+)((?=[^(]|\s|$)|(\(([^)]*)\)(?=\s|$|\W)))/gi;
const VARIABLE_NAME_REGEX = /(\$\w+)/i;

// -----
//  Private
// -----

// _resolveOne()
const _resolveOne = function _resolveOne(name, args, request) {
  return new Promise((resolve, reject) => {
    const vari = variableStore.getOne(name);
    if ( vari != null ) {
      const promises = [];
      if ( args != null && args.length > 0 ) {
        args.forEach((arg) => {
          if ( VARIABLE_NAME_REGEX.test(arg) === true ) {
            promises.push(_resolveOne(arg, null, request));
          }
          else {
            promises.push(Promise.resolve(arg));
          }
        });
      }
      
      Promise.all(promises)
        .then((result) => {
          return vari.resolve(result, request, name);
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(error));
    }
    else {
      resolve(null);
    }
  });
}; //- _resolveOne()

// _replace()
const _replace = function _replace(message, variables) {
  variables = variables || [];

  let index = -1;
  const newMessage = message.replace(VARIABLE_REGEX, (match) => {
    index++;
    if ( index <= variables.length - 1 ) {
      if ( variables[index] != null ) {
        return variables[index];
      }

      return match;
    }

    return match;
  });

  return newMessage; 
}; //- _replace()

// -----
//  Exports
// -----

// resolve()
export const resolve = function resolve(message, request) {
  return new Promise((resolve, reject) => {
    const regexp = new RegExp(VARIABLE_REGEX);
    if ( regexp.test(message) === true ) {
      regexp.lastIndex = 0;

      const promises = [];

      let match;
      while ( (match = regexp.exec(message)) != null ) {
        const vname = match[1];
        let args = [];

        if ( match.length >= 5 && match[4] != null ) {
          args = match[4].split(/,\s?/);
        }

        promises.push(_resolveOne(vname, args, request));
      }

      Promise.all(promises)
        .then((result) => {
          return _replace(message, result);
        })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(error));
    }
    else {
      resolve(message);
    }
  });
}; //- resolve()