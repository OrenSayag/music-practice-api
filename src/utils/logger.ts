import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.logger.level,
  ...(!config.server.isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
});
