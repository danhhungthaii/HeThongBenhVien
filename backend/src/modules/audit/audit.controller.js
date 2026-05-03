'use strict';
const auditService = require('./audit.service');
const { successResponse } = require('../../common/helpers/responseHelper');

async function getAuditLogs(req, res) {
  const logs = await auditService.getAuditLogs(req.query);
  res.status(200).json(successResponse(logs));
}

module.exports = { getAuditLogs };
