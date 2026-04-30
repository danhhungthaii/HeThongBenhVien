'use strict';
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const config = require('./config');
const { default: db, USE_MOCK_DB } = require('./database/mockDb');
const { errorHandler } = require('./common/middlewares/errorHandler');
const { morganMiddleware } = require('./common/middlewares/requestLogger');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(config.apiPrefix, routes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} not found` } });
});

app.use(errorHandler);

async function startServer(port) {
  return new Promise((resolve) => {
    app.listen(port || config.port, () => {
      console.log('[Server] HIS Backend running on port ' + (port || config.port));
      console.log('[Server] API: http://localhost:' + (port || config.port) + config.apiPrefix);
      resolve();
    });
  });
}

module.exports = { app, startServer };

if (require.main === module) {
  startServer();
}
