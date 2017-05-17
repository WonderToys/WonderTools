import path from 'path';
import url from 'url';
import { app, ipcMain, Menu, session, dialog } from 'electron';
import electronOauth2 from 'electron-oauth2';
import { autoUpdater } from 'electron-updater';
import jetpack from 'fs-jetpack';
import TwitchApi from 'twitch-api';

import { devMenuTemplate } from './window/menu/dev_menu_template';
import { editMenuTemplate } from './window/menu/edit_menu_template';
import createWindow from './window/helpers/window';

import env from './env';

import appConfig from '../config';

const setApplicationMenu = () => {
  const menus = [ editMenuTemplate ];
  // if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  // }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

if ( env.name !== 'production' ) {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}

// -----
//  OnReady
// -----

app.on('ready', () => {
  // Setup application
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

  // AutoUpdater
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('set-notification', 'Checking for updates ...');
  });

  autoUpdater.on('download-progress', (event) => {
    mainWindow.webContents.send('set-notification', `Downloading Update (${ Math.round(event.percent) }%)`);
  });

  autoUpdater.on('error', () => {
    mainWindow.webContents.send('set-notification', '');
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'New Version',
      message: 'A new version of WonderTools has been downloaded. Would you like to quit and install it now?',
      buttons: ['Of course!', 'Nah']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall()
      }
      else {
        mainWindow.webContents.send('set-notification', '');
      }
    });
  });

  // check
  ipcMain.once('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });

  // twitch-auth
  ipcMain.removeAllListeners('twitch-auth');
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
      scope: 'user_read chat_login'
    };

    if ( kind === 'streamer' ) {
      scope: 'channel_check_subscription channel_subscriptions channel_editor channel_feed_edit channel_feed_read'
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
  }); //- twitch-auth
});

app.on('window-all-closed', () => {
  app.quit();
});
