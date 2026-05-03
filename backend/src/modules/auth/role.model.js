'use strict';

// Roles not stored in separate table — derive from Users.Role column
const { poolPromise, sql } = require('../../database/database.real');

async function findRoleByName(roleName) {
  return { role_id: roleName, role_name: roleName };
}

async function findRoleById(roleId) {
  return { role_id: roleId, role_name: roleId };
}

async function getAllRoles() {
  const pool = await poolPromise;
  const result = await pool.request().query(`SELECT DISTINCT Role FROM Users`);
  return result.recordset.map(r => ({ role_id: r.Role, role_name: r.Role }));
}

async function createRole(data) {
  return { role_id: data.role_name, role_name: data.role_name };
}

module.exports = { findRoleByName, findRoleById, getAllRoles, createRole };
