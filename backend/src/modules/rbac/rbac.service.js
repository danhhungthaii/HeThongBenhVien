'use strict';
// Roles/Permissions tables not in HeThongBV schema — stub
const userModel = require('../auth/user.model');

async function getRoles() {
  // Return roles derived from distinct role values in Users table
  const { poolPromise, sql } = require('../../database/database.real');
  const pool = await poolPromise;
  const result = await pool.request().query(`SELECT DISTINCT Role FROM Users`);
  return result.recordset.map(r => ({ role_id: r.Role, role_name: r.Role }));
}

async function getRoleById(roleId) {
  return { role_id: roleId, role_name: roleId };
}

async function getPermissions() {
  return [];
}

async function getUserPermissions(userId) {
  return userModel.getUserPermissions(userId);
}

module.exports = { getRoles, getRoleById, getPermissions, getUserPermissions };
