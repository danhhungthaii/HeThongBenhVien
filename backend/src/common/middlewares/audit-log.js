let auditLogs = [];

function addAuditLog(entry) {
  const record = {
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  };

  auditLogs.push(record);
  return record;
}

function getAuditLogs() {
  return auditLogs;
}

module.exports = { auditLogs, addAuditLog, getAuditLogs };