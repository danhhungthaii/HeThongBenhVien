const app = require('./app');
const { env } = require('./config/env');
const { logger } = require('./common/helpers/logger');

app.listen(env.port, () => {
  logger.info('Server started', {
    port: env.port,
    environment: env.nodeEnv,
  });
});