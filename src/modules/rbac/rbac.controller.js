'use strict';
const rbacService = require('../services/rbac.service');
const { successResponse } = require('../../../common/helpers/responseHelper');
const { auth } = require('../../../common/middlewares/auth');

async function getRoles(req, res) {
  const roles = await rbacService.getRoles();
  res.status(200).json(successResponse(roles));
}

async function getPermissions(req, res) {
  const permissions = await rbacService.getPermissions();
  res.status(200).json(successResponse(permissions));
}

async function getMyPermissions(req, res) {
  const permissions = await rbacService.getUserPermissions(req.user.userId);
  res.status(200).json(successResponse(permissions));
}

module.exports = { getRoles, getPermissions, getMyPermissions };
