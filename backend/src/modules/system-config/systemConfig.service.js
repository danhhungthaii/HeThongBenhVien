'use strict';
// SystemConfig table not in HeThongBV schema — return empty / no-op

async function getSystemConfigs() {
  return [];
}

async function getConfigByKey(key) {
  return null;
}

async function updateConfig(key, value) {
  return { config_key: key, config_value: value };
}

async function bulkUpdateConfigs(updates) {
  return Object.entries(updates).map(([key, value]) => ({ config_key: key, config_value: value }));
}

module.exports = { getSystemConfigs, getConfigByKey, updateConfig, bulkUpdateConfigs };
