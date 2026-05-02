'use strict';
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_in_production',
  ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
};
