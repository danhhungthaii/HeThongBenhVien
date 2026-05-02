'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const app = require('../src/app');

const TEST_PORT = 3001;
const PORT_FILE = path.join(__dirname, '.test-port.json');

module.exports = async () => {
  // Start HTTP server for health check and external requests
  await new Promise((resolve) => {
    const server = http.createServer(app).listen(TEST_PORT, () => resolve(server));
  });

  // Write port config so test files can read it
  fs.writeFileSync(PORT_FILE, JSON.stringify({ port: TEST_PORT, url: `http://localhost:${TEST_PORT}` }));
  process.env.TEST_BASE_URL = `http://localhost:${TEST_PORT}`;
};
