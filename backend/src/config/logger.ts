import winston from 'winston';
import { config } from './index';

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'traknor-cmms-api' },
  transports: [
    // Write to all logs with level `info` and below to combined log
    new winston.transports.File({ filename: config.log.file }),
    
    // Write all logs with level `error` and below to error log
    new winston.transports.File({ 
      filename: config.log.file.replace('.log', '-error.log'), 
      level: 'error' 
    }),
  ],
});

// If we're not in production then log to the console with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;