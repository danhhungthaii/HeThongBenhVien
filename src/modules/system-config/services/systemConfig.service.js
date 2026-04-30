'use strict';
const db = require('../../../config/database');

async function getSystemConfigs() {
  return db.findAll('systemConfigs');
}

async function getConfigByKey(key) {
  return db.findOne('systemConfigs', c => c.config_key === key);
}

async function updateConfig(key, value) {
  const item = await getConfigByKey(key);
  if (!item) {
    const newConfig = {
      config_id: ++db.counters.systemConfig,
      config_key: key,
      config_value: value,
      description: null,
      updated_at: new Date(),
    };
    return db.insert('systemConfigs', newConfig);
  }
  db.update('systemConfigs', c => c.config_id === item.config_id, { config_value: value, updated_at: new Date() });
  return { ...item, config_value: value, updated_at: new Date() };
}

async function bulkUpdateConfigs(updates) {
  const results = [];
  for (const [key, value] of Object.entries(updates)) {
    results.push(await updateConfig(key, value));
  }
  return results;
}

module.exports = { getSystemConfigs, getConfigByKey, updateConfig, bulkUpdateConfigs };
