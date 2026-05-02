'use strict';
const fs = require('fs');
const path = require('path');
const request = require('supertest');

const PORT_FILE = path.join(__dirname, '.test-port.json');
const DEFAULT_PORT = 3001;
const API_PREFIX = '/api/v1';

function getBaseUrl() {
  try {
    if (fs.existsSync(PORT_FILE)) {
      const config = JSON.parse(fs.readFileSync(PORT_FILE, 'utf8'));
      return config.url || `http://localhost:${DEFAULT_PORT}`;
    }
  } catch (_) {}
  return process.env.TEST_BASE_URL || `http://localhost:${DEFAULT_PORT}`;
}

const BASE_URL = getBaseUrl();

async function api(method, endpoint, body, token) {
  const app = require('../src/app');
  let req = request(app)[method](`${API_PREFIX}${endpoint}`);
  if (token) req = req.set('Authorization', `Bearer ${token}`);
  if (body) req = req.send(body);
  return req.set('Content-Type', 'application/json');
}

async function loginAsAdmin() {
  const app = require('../src/app');
  const res = await request(app)
    .post(`${API_PREFIX}/auth/login`)
    .send({ username: 'admin', password: 'admin123' })
    .set('Content-Type', 'application/json');
  return res.body.data?.accessToken;
}

async function loginAsDoctor() {
  const app = require('../src/app');
  const res = await request(app)
    .post(`${API_PREFIX}/auth/login`)
    .send({ username: 'doctor01', password: 'doctor123' })
    .set('Content-Type', 'application/json');
  return res.body.data?.accessToken;
}

function assertSuccess(res) {
  expect(res.status).toBeLessThanOrEqual(299);
  expect(res.body).toHaveProperty('success', true);
  expect(res.body).toHaveProperty('data');
}

function assertError(res, expectedCode) {
  expect(res.status).toBeGreaterThanOrEqual(400);
  expect(res.body).toHaveProperty('success', false);
  if (expectedCode) {
    expect(res.body.error).toHaveProperty('code', expectedCode);
  }
}

module.exports = { BASE_URL, API_PREFIX, api, loginAsAdmin, loginAsDoctor, assertSuccess, assertError };
