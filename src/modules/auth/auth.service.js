'use strict';
const userModel = require('../models/user.model');
const tokenService = require('./token.service');
const { UnauthorizedError, ValidationError } = require('../../../common/errors/AppError');
const { MAX_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_DURATION_MS } = require('../../../common/constants');

async function login(username, password) {
  const user = await userModel.findUserByUsername(username);

  if (!user) {
    throw new UnauthorizedError('Invalid username or password');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is inactive');
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new UnauthorizedError('Account is locked due to too many failed attempts');
  }

  const isValid = await tokenService.comparePassword(password, user.password_hash);
  if (!isValid) {
    const attempts = user.failed_login_attempts + 1;
    const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS)
      : null;
    await userModel.updateLoginFailure(user.user_id, attempts, lockedUntil);
    throw new UnauthorizedError('Invalid username or password');
  }

  await userModel.updateLoginSuccess(user.user_id);
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);
  const permissions = await userModel.getUserPermissions(user.user_id);

  return {
    accessToken,
    refreshToken,
    user: {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: permissions.map(p => ({ resource: p.resource, action: p.action })),
    },
  };
}

async function logout(userId) {
  return { success: true, message: 'Logged out successfully' };
}

async function refreshToken(refreshTokenStr) {
  let payload;
  try {
    payload = tokenService.verifyToken(refreshTokenStr);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  if (payload.type !== 'refresh') {
    throw new UnauthorizedError('Invalid token type');
  }

  const user = await userModel.findUserById(payload.userId);
  if (!user || !user.is_active) {
    throw new UnauthorizedError('User not found or inactive');
  }

  const permissions = await userModel.getUserPermissions(user.user_id);
  return {
    accessToken: tokenService.generateAccessToken(user),
    refreshToken: tokenService.generateRefreshToken(user),
    user: {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      permissions: permissions.map(p => ({ resource: p.resource, action: p.action })),
    },
  };
}

async function forgotPassword(email) {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    return { message: 'If the email exists, a reset link will be sent' };
  }
  return { message: 'Password reset token generated (mock — implement SMTP)' };
}

async function resetPassword(token, newPassword) {
  try {
    const payload = tokenService.verifyToken(token);
    if (payload.type !== 'reset') {
      throw new Error('Invalid token type');
    }
    const passwordHash = await tokenService.hashPassword(newPassword);
    await userModel.updatePassword(payload.userId, passwordHash);
    return { message: 'Password reset successfully' };
  } catch {
    throw new UnauthorizedError('Invalid or expired reset token');
  }
}

async function getProfile(userId) {
  const user = await userModel.findUserById(userId);
  if (!user) throw new UnauthorizedError('User not found');
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword, getProfile };
