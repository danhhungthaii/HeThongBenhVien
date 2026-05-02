'use strict';
const db = require('../../config/database');

async function findUserByUsername(username) {
  return db.findOne('users', u => u.username === username);
}

async function findUserById(userId) {
  return db.findOne('users', u => u.user_id === userId);
}

async function findUserByEmail(email) {
  return db.findOne('users', u => u.email === email);
}

async function createUser(data) {
  const user = {
    user_id: ++db.counters.user,
    username: data.username,
    password_hash: data.passwordHash,
    email: data.email || null,
    role: data.role || 'user',
    staff_id: data.staffId || null,
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return db.insert('users', user);
}

async function updateLoginSuccess(userId) {
  return db.update('users', u => u.user_id === userId, {
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(),
  });
}

async function updateLoginFailure(userId, attempts, lockedUntil) {
  return db.update('users', u => u.user_id === userId, {
    failed_login_attempts: attempts,
    locked_until: lockedUntil,
  });
}

async function updatePassword(userId, passwordHash) {
  return db.update('users', u => u.user_id === userId, { password_hash: passwordHash });
}

async function getUserPermissions(userId) {
  const userPerms = db.findMany('userPermissions', up => up.user_id === userId);
  const permIds = userPerms.map(up => up.permission_id);
  return db.findMany('permissions', p => permIds.includes(p.permission_id));
}

async function grantPermission(userId, permissionId) {
  const exists = db.findOne('userPermissions', up => up.user_id === userId && up.permission_id === permissionId);
  if (!exists) {
    db.insert('userPermissions', { user_id: userId, permission_id: permissionId });
  }
  return true;
}

module.exports = {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  createUser,
  updateLoginSuccess,
  updateLoginFailure,
  updatePassword,
  getUserPermissions,
  grantPermission,
};
