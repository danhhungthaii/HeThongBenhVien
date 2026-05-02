'use strict';
const db = require('../../config/database');
const userModel = require('../auth/user.model');

async function getRoles() {
  const roles = db.findAll('roles');
  const result = [];
  for (const role of roles) {
    const permissions = [];
    // Admin role gets all permissions
    if (role.role_name === 'Admin') {
      permissions.push(...db.findAll('permissions'));
    }
    result.push({ ...role, permissions });
  }
  return result;
}

async function getRoleById(roleId) {
  return db.findOne('roles', r => r.role_id === roleId);
}

async function getPermissions() {
  return db.findAll('permissions');
}

async function getUserPermissions(userId) {
  return userModel.getUserPermissions(userId);
}

module.exports = { getRoles, getRoleById, getPermissions, getUserPermissions };
