'use strict';

const fs = require('fs');
const path = require('path');

const PORT_FILE = path.join(__dirname, '.test-port.json');

module.exports = async () => {
  try { fs.unlinkSync(PORT_FILE); } catch (_) {}
};
