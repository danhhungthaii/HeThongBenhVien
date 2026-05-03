'use strict';
const configService = require('./systemConfig.service');
const { successResponse } = require('../../common/helpers/responseHelper');

async function getAll(req, res) {
  const configs = await configService.getSystemConfigs();
  const formatted = configs.reduce((acc, c) => { acc[c.config_key] = c.config_value; return acc; }, {});
  res.status(200).json(successResponse(formatted));
}

async function updateOne(req, res) {
  const { key, value } = req.body;
  const updated = await configService.updateConfig(key, value);
  res.status(200).json(successResponse(updated));
}

async function bulkUpdate(req, res) {
  const updated = await configService.bulkUpdateConfigs(req.body);
  res.status(200).json(successResponse(updated));
}

module.exports = { getAll, updateOne, bulkUpdate };
