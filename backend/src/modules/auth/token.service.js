'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = require('../../config/jwt');

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.user_id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.user_id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, hashPassword, comparePassword };
