'use strict';
require('dotenv').config();

const APP_PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  port: APP_PORT,
  apiPrefix: API_PREFIX,
  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
};
