'use strict';
const authService = require('../services/auth.service');
const { successResponse } = require('../../../common/helpers/responseHelper');

async function login(req, res) {
  const result = await authService.login(req.body.username, req.body.password);
  res.status(200).json(successResponse(result));
}

async function logout(req, res) {
  const result = await authService.logout(req.user?.userId);
  res.status(200).json(successResponse(result));
}

async function refreshToken(req, res) {
  const { refreshToken: tokenStr } = req.body;
  const result = await authService.refreshToken(tokenStr);
  res.status(200).json(successResponse(result));
}

async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json(successResponse(result));
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  res.status(200).json(successResponse(result));
}

async function getProfile(req, res) {
  const result = await authService.getProfile(req.user.userId);
  res.status(200).json(successResponse(result));
}

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword, getProfile };
