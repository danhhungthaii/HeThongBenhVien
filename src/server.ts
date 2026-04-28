import app from './app';
import { env } from './common/config/env';
import { logger } from './common/logger/logger';

app.listen(env.port, () => {
  logger.info('Server started', {
    port: env.port,
    environment: env.nodeEnv,
  });
});
