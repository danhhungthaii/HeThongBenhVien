'use strict';
const db = require('../config/database');

async function logAudit(userId, action, resource, resourceId, oldValue, newValue, req) {
  const sql = `
    INSERT INTO AuditLogs
      (user_id, action, resource, resource_id, old_value, new_value, ip_address, user_agent, created_at)
    VALUES
      (@userId, @action, @resource, @resourceId, @oldValue, @newValue, @ipAddress, @userAgent, GETUTCDATE())
  `;
  await db.query(sql, {
    userId: userId || null,
    action,
    resource,
    resourceId: resourceId || null,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
    ipAddress: req?.ip || req?.connection?.remoteAddress || null,
    userAgent: req?.headers?.['user-agent'] || null,
  });
}

module.exports = { logAudit };
