import { join } from 'path';
import { remote, ipcRenderer, shell } from 'electron';
import { Logger, transports } from 'winston';
import mkdirp from 'mkdirp';

// Create logger
const logPath = join(remote.app.getPath('userData'), 'log');
mkdirp.sync(logPath);

const logger = new Logger({
  transports: [
    new transports.File({
      name: 'error-log',
      filename: join(logPath, 'error.log'),
      level: 'error'
    })
  ]
});

// Helpers

// openErrorDialog()
const openErrorDialog = function openErrorDialog() {
  const $errorModal = $('#errorModal');

  $errorModal.find('#errorLogPath').text(join(logPath, 'error.log'));

  $errorModal.find('#supportLink').off('click');
  $errorModal.find('#supportLink').on('click', () => {
    shell.openExternal('http://community.wondertools.tv');
  });

  $('#errorModal').modal('open');
}; //- openErrorDialog()

// Add Listeners
window.addEventListener('error', (event) => {
  logger.error(event.error);
  openErrorDialog();

  return false;
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error(event.reason);
  openErrorDialog();

  return false;
});