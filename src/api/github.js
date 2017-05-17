import path from 'path';
import fs from 'fs';

import request from 'request';
import mkdirp from 'mkdirp';

// -----
//  Helpers
// -----

const DEFAULT_HEADERS = {
  'User-Agent': 'WonderTools',
  Accept: 'application/vnd.github.mercy-preview+json'
};

// getRepositories()
const getRepositories = function getRepositories() {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://api.github.com/search/repositories?q=topic:wondertools',
      method: 'GET',
      headers: DEFAULT_HEADERS
    }, 
    (err, resp, body) => {
      if ( err != null ) return reject(err);
      body = JSON.parse(body);
      resolve(body.items.map(i => {
        return { 
          url: i.html_url,
          contentsUrl: i.contents_url, 
          updated: i.pushed_at 
        };
      }));
    });
  });
}; //- getRepositories()

// getModuleJson()
const getModuleJson = function getModuleJson(data) {
  const url = data.contentsUrl;

  return new Promise((resolve, reject) => {
    request({
      url: url.replace('{+path}', 'module.json'),
      method: 'GET',
      headers: DEFAULT_HEADERS
    }, 
    (err, resp, body) => {
      if ( resp.statusCode === 404 ) {
        return resolve(null);
      }
      
      body = JSON.parse(body);
      const content = body.content;
      if ( content == null || typeof(content) !== 'string' || content.length === 0 ) {
        return resolve(null);
      }

      const modDef = JSON.parse(atob(content));
      resolve(Object.assign({}, modDef, { updated: data.updated, url: data.url }));
    });
  });
}; //- getModuleJson()

// filterModules()
const filterModules = function filterModules(repos) {
  const promises = repos.map(data => getModuleJson(data));
  return Promise.all(promises);
}; //- filterModules()

// -----
//  Exports
// -----

// getRemoteModules()
export const getRemoteModules = function getRemoteModules() {
  return getRepositories()
    .then((repos) => filterModules(repos))
    .then((modules) => modules.filter(m => m != null));
}; //- getRemoteModules()

// downloadArchive()
export const downloadArchive = function downloadArchive(baseUrl, savePath) {
  return new Promise((resolve, reject) => {
    mkdirp.sync(path.dirname(savePath));
    
    request.get(`${ baseUrl }/archive/master.zip`)
      .on('response', (res) => {
        const fws = fs.createWriteStream(savePath);
        res.pipe(fws);

        res.on('error', (err) => {
          return reject(err);
        })

        res.on('end', () => {
          return resolve(savePath);
        });
      });
  });
}; //- downloadArchive()