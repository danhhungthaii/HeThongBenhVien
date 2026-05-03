const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Database configuration
  dbMode: process.env.DB_MODE ?? 'memory', // 'memory' or 'sql'
  // SQL Server configuration (used when dbMode === 'sql')
  sqlServer: {
    server: process.env.SQL_SERVER ?? 'localhost',
    port: Number(process.env.SQL_PORT ?? 1433),
    database: process.env.SQL_DATABASE ?? 'HeThongBenhVien',
    username: process.env.SQL_USERNAME ?? 'sa',
    password: process.env.SQL_PASSWORD ?? '',
    encrypt: process.env.SQL_ENCRYPT !== 'false', // default true
    trustServerCertificate: process.env.SQL_TRUST_CERT === 'true', // default false
  },
};

module.exports = { env };