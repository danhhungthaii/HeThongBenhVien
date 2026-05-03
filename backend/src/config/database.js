'use strict';

/**
 * Database Layer — Mock (in-memory) cho giai đoạn test.
 * Khi có SQL Server thật: xóa USE_MOCK_DB, dùng mssql từ src/config/database.real.js
 */
const USE_MOCK_DB = true;

if (USE_MOCK_DB) {
  module.exports = require('../database/mockDb');
} else {
  module.exports = require('../database/database.real'); // chưa có — tạo khi có DB thật
}
