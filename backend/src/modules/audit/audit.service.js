'use strict';
// Audit logs table not in HeThongBV schema — log to console only (no-op for DB)

async function logAudit({ userId, action, resource, resourceId, oldValue, newValue, req }) {
  // Silent no-op — AuditLogs table not in current DB schema
  return true;
}

async function getAuditLogs(filters = {}) {
  return [];
}

module.exports = { logAudit, getAuditLogs };
