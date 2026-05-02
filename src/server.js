const app = require('./app');
const { env } = require('./common/config/env');
const { logger } = require('./common/logger/logger');

app.listen(env.port, () => {
  logger.info('Server started', {
    port: env.port,
    environment: env.nodeEnv,
  });
});