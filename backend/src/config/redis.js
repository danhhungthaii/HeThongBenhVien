'use strict';
const redis = require('ioredis');

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
};

let client = null;

function getClient() {
  if (!client) {
    client = new redis(REDIS_CONFIG);
    client.on('error', err => console.error('[Redis] Error:', err));
    client.on('connect', () => console.log('[Redis] Connected'));
  }
  return client;
}

async function get(key) {
  const value = await getClient().get(key);
  return value ? JSON.parse(value) : null;
}

async function set(key, value, ttlSeconds = 3600) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return getClient().setex(key, ttlSeconds, serialized);
}

async function del(key) {
  return getClient().del(key);
}

async function delPattern(pattern) {
  const keys = await getClient().keys(pattern);
  if (keys.length > 0) {
    return getClient().del(...keys);
  }
}

async function disconnect() {
  if (client) {
    await client.quit();
    client = null;
  }
}

module.exports = { getClient, get, set, del, delPattern, disconnect };
