'use strict';
const db = require('../../config/database');

async function getServices(filters = {}) {
  let items = db.findAll('services');

  if (filters.department_id) {
    items = items.filter(s => s.department_id === parseInt(filters.department_id));
  }
  if (filters.category) {
    items = items.filter(s => s.category === filters.category);
  }
  if (filters.is_bhyt !== undefined) {
    items = items.filter(s => s.is_bhyt === (filters.is_bhyt === 'true' || filters.is_bhyt === true));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(s =>
      s.service_name.toLowerCase().includes(q) ||
      (s.service_code && s.service_code.toLowerCase().includes(q))
    );
  }

  return items;
}

async function getServiceById(id) {
  return db.findOne('services', s => s.service_id === parseInt(id));
}

async function createService(data) {
  const service = {
    service_id: ++db.counters.service,
    service_code: data.service_code,
    service_name: data.service_name,
    category: data.category || null,
    department_id: data.department_id || null,
    base_price: data.base_price || 0,
    bhyt_price: data.bhyt_price || 0,
    is_bhyt: data.is_bhyt || false,
    is_active: true,
    created_at: new Date(),
  };
  return db.insert('services', service);
}

async function updateService(id, changes) {
  const updated = db.update('services', s => s.service_id === parseInt(id), changes);
  if (!updated.length) return null;
  return updated[0];
}

module.exports = { getServices, getServiceById, createService, updateService };
