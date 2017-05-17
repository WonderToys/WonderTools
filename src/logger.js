import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { remote } from 'electron';
import { Logger, transports } from 'winston';
import mkdirp from 'mkdirp';

// Create logger
const logPath = join(remote.app.getPath('userData'), 'log');
mkdirp.sync(logPath);

// Remove twitch logs, if found
if ( existsSync(join(logPath, 'twitch-error.log')) ) {
  unlinkSync(join(logPath, 'twitch-error.log'));
}
if ( existsSync(join(logPath, 'twitch-warn.log')) ) {
  unlinkSync(join(logPath, 'twitch-warn.log'));
}
if ( existsSync(join(logPath, 'twitch-info.log')) ) {
  unlinkSync(join(logPath, 'twitch-info.log'));
}

// Exports
export const logger = new Logger({
  transports: [
    new transports.File({
      name: 'error-log',
      filename: join(logPath, 'error.log'),
      level: 'error',
      maxsize: 500*1024,
      maxFiles: 2,
      zippedArchive: true
    }),
    new transports.File({
      name: 'info-log',
      filename: join(logPath, 'info.log'),
      level: 'info',
      maxsize: 500*1024,
      maxFiles: 2,
      zippedArchive: true
    })
  ]
});

export const twitchLogger = new Logger({
  transports: [
    new transports.File({
      name: 'twitch-error-log',
      filename: join(logPath, 'twitch-error.log'),
      level: 'error',
      maxsize: 500*1024,
      maxFiles: 2,
      zippedArchive: true
    }),
    new transports.File({
      name: 'twitch-warn-log',
      filename: join(logPath, 'twitch-warn.log'),
      level: 'warn',
      maxsize: 500*1024,
      maxFiles: 2,
      zippedArchive: true
    }),
    new transports.File({
      name: 'twitch-info-log',
      filename: join(logPath, 'twitch-info.log'),
      level: 'info',
      maxsize: 500*1024,
      maxFiles: 2,
      zippedArchive: true
    })
  ]
});