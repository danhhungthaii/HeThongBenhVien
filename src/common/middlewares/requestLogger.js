'use strict';
const morgan = require('morgan');
const { NODE_ENV } = require('../../config');

const morganMiddleware = morgan((tokens, req, res) => {
  const log = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    `${tokens['response-time'](req, res)}ms`,
    `- ${tokens.res(req, res, 'content-length') || 0}`,
  ].join(' ');
  return log;
}, { skip: () => NODE_ENV === 'test' });

module.exports = { morganMiddleware };
