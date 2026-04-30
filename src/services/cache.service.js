'use strict';
const redis = require('../config/redis');
const CACHE_TTL = {
  CATALOG: 3600,
  DEPARTMENT: 1800,
  ICD10: 7200,
  DASHBOARD: 300,
  PRICE_LIST: 3600,
};

async function getCached(key) {
  return redis.get(key);
}

async function setCache(key, data, ttlSeconds = 3600) {
  return redis.set(key, data, ttlSeconds);
}

async function invalidateCache(pattern) {
  return redis.delPattern(pattern);
}

async function invalidateModuleCache(moduleName) {
  return redis.delPattern(`${moduleName}:*`);
}

module.exports = {
  getCached,
  setCache,
  invalidateCache,
  invalidateModuleCache,
  CACHE_TTL,
};
