import { createLogger, format, transports } from 'winston';
import {NODE_ENV} from './env.js';

const { combine, timestamp, errors, json, colorize, simple } = format;
const isProduction = NODE_ENV == 'production';
const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

if (!isProduction) {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple()),
    })
  );
}

export default logger;
