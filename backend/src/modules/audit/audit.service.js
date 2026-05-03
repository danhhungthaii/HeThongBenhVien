'use strict';
const db = require('../../config/database');

async function logAudit({ userId, action, resource, resourceId, oldValue, newValue, req }) {
  const entry = {
    audit_id: ++db.counters.audit,
    user_id: userId || null,
    action,
    resource,
    resource_id: resourceId || null,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
    ip_address: req?.ip || null,
    user_agent: req?.headers?.['user-agent'] || null,
    created_at: new Date(),
  };
  return db.insert('auditLogs', entry);
}

async function getAuditLogs(filters = {}) {
  let items = db.findAll('auditLogs').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (filters.user_id) {
    items = items.filter(l => l.user_id === parseInt(filters.user_id));
  }
  if (filters.action) {
    items = items.filter(l => l.action === filters.action);
  }
  if (filters.resource) {
    items = items.filter(l => l.resource === filters.resource);
  }
  if (filters.from_date) {
    const from = new Date(filters.from_date);
    items = items.filter(l => new Date(l.created_at) >= from);
  }
  if (filters.to_date) {
    const to = new Date(filters.to_date);
    items = items.filter(l => new Date(l.created_at) <= to);
  }

  return items;
}

module.exports = { logAudit, getAuditLogs };
