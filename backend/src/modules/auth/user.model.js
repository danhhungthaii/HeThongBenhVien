'use strict';

/**
 * user.model.js — SQL Server implementation
 * Table: Users (User_ID, Username, Password_Hash, Display_Name, Role, Created_At)
 */
const { poolPromise, sql } = require('../../database/database.real');

async function getPool() {
  return poolPromise;
}

async function findUserByUsername(username) {
  const pool = await getPool();
  const result = await pool.request()
    .input('username', sql.NVarChar(50), username)
    .query('SELECT * FROM Users WHERE Username = @username');
  const row = result.recordset[0];
  if (!row) return null;
  return mapUser(row);
}

async function findUserById(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query('SELECT * FROM Users WHERE User_ID = @userId');
  const row = result.recordset[0];
  if (!row) return null;
  return mapUser(row);
}

async function findUserByEmail(email) {
  // Users table has no email column in current schema — return null
  return null;
}

async function createUser(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('username', sql.NVarChar(50), data.username)
    .input('passwordHash', sql.NVarChar(255), data.passwordHash)
    .input('displayName', sql.NVarChar(100), data.displayName || data.username)
    .input('role', sql.NVarChar(50), data.role || 'user')
    .query(`
      INSERT INTO Users (Username, Password_Hash, Display_Name, Role)
      OUTPUT INSERTED.*
      VALUES (@username, @passwordHash, @displayName, @role)
    `);
  return mapUser(result.recordset[0]);
}

async function updateLoginSuccess(userId) {
  // No failed_login_attempts / locked_until columns in current schema — no-op
  return true;
}

async function updateLoginFailure(userId, attempts, lockedUntil) {
  // No failed_login_attempts / locked_until columns in current schema — no-op
  return true;
}

async function updatePassword(userId, passwordHash) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .query('UPDATE Users SET Password_Hash = @passwordHash WHERE User_ID = @userId');
  return true;
}

async function getUserPermissions(userId) {
  // No permissions table in current schema — return empty array
  return [];
}

async function grantPermission(userId, permissionId) {
  return true;
}

// Map DB columns -> camelCase for app
function mapUser(row) {
  return {
    user_id: row.User_ID,
    username: row.Username,
    password_hash: row.Password_Hash,
    display_name: row.Display_Name,
    role: row.Role,
    created_at: row.Created_At,
    // Compatibility fields (not in DB, provide defaults)
    email: null,
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
  };
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
