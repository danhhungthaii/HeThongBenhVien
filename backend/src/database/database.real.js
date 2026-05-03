'use strict';

const sql = require('mssql/msnodesqlv8');
const { env } = require('../config/env');
const { logger } = require('../common/helpers/logger');

// Construct ODBC connection string
const driver = 'ODBC Driver 18 for SQL Server';
const connString = `Driver={${driver}};Server=${env.sqlServer.server};Database=${env.sqlServer.database};Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;`;

const sqlConfig = {
  connectionString: connString
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    logger.info('Connected to SQL Server successfully.');
    return pool;
  })
  .catch(err => {
    logger.error('Database Connection Failed! ', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
