'use strict';
const db = require('../../../config/database');

async function findRoleByName(roleName) {
  return db.findOne('roles', r => r.role_name === roleName);
}

async function findRoleById(roleId) {
  return db.findOne('roles', r => r.role_id === roleId);
}

async function getAllRoles() {
  return db.findAll('roles');
}

async function createRole(data) {
  const role = {
    role_id: ++db.counters.role,
    role_name: data.role_name,
    description: data.description || null,
    is_active: true,
    created_at: new Date(),
  };
  return db.insert('roles', role);
}

module.exports = { findRoleByName, findRoleById, getAllRoles, createRole };
