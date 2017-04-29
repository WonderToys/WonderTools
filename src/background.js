import path from 'path';
import url from 'url';
import { app, ipcMain, Menu, session } from 'electron';
import electronOauth2 from 'electron-oauth2';
import jetpack from 'fs-jetpack';
import TwitchApi from 'twitch-api';

import { devMenuTemplate } from './window/menu/dev_menu_template';
import { editMenuTemplate } from './window/menu/edit_menu_template';
import createWindow from './window/helpers/window';

import env from './env';

import appConfig from '../config';

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

if ( env.name !== 'production' ) {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}

app.on('ready', () => {
  setApplicationMenu();
  const twitch = new TwitchApi({
    clientId: appConfig.twitch.clientId
  });

  const mainWindow = createWindow('main', {
    width: 1024,
    height: 576,
    maximizable: false,
    resizable: false,
    titleBarStyle: 'hidden'
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));

  if (env.name === 'development') {
    //mainWindow.openDevTools();
  }

  ipcMain.on('twitch-auth', (event, kind) => {
    var config = {
      clientId: appConfig.twitch.clientId,
      clientSecret: appConfig.twitch.clientSecret,
      authorizationUrl: 'https://api.twitch.tv/kraken/oauth2/authorize',
      tokenUrl: 'https://api.twitch.tv/kraken/oauth2/token',
      useBasicAuthorizationHeader: false,
      redirectUri: 'http://localhost'
    };

    const windowParams = {
      name: 'twitch-auth-window',
      alwaysOnTop: true,
      autoHideMenuBar: true,
      maximizable: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
      },
      width: 404,
      height: 582,
    }

    const options = {
      scope: 'user_read'
    };

    if ( kind === 'bot' ) {
      options.scope += ' chat_login';
    }
    else if ( kind === 'streamer' ) {

    }

    const myApiOauth = electronOauth2(config, windowParams);
    myApiOauth.getAccessToken(options)
      .then((token) => {
        twitch.getAuthenticatedUser(token.access_token, (err, result) => {
          if ( err != null ) {
            return event.sender.send('twitch-auth-reply', {
              error: err
            });
          }

          if ( result != null ) {
            token.display_name = result.display_name;
            token.user_id = result._id.toString();
          }

          event.sender.send('twitch-auth-reply', { 
            kind, 
            response: token
          });
        });

        session.defaultSession.clearStorageData();
      })
      .catch((error) => {
        session.defaultSession.clearStorageData();
        return event.sender.send('twitch-auth-reply', { error });
      });
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
