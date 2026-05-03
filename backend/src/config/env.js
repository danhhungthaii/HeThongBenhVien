require('dotenv').config();

const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Database configuration
  dbMode: process.env.DB_MODE ?? 'memory', // 'memory' or 'sql'
  // SQL Server configuration (used when dbMode === 'sql')
  sqlServer: {
    server: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? 'HeThongBV',
    username: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PASSWORD ?? '',
    encrypt: process.env.DB_ENCRYPT === 'true', // default false
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true', // default false
    integratedSecurity: process.env.DB_INTEGRATED_SECURITY === 'true', // default false
  },
};

module.exports = { env };