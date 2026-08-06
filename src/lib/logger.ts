import pino from 'pino';

const options: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
};

if (process.env.NODE_ENV !== 'production') {
  options.transport = {
    target: 'pino-pretty',
  };
}

const logger = pino(options);

export default logger;
