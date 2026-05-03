'use strict';

const { env } = require('./env');

/**
 * Database Layer
 */
const USE_MOCK_DB = env.dbMode === 'memory';

if (USE_MOCK_DB) {
  module.exports = require('../database/mockDb');
} else {
  module.exports = require('../database/database.real');
}
