'use strict';
const Joi = require('joi');

const loginSchema = {
  username: Joi.string().required().min(2).max(50),
  password: Joi.string().required().min(4).max(100),
};

const forgotPasswordSchema = {
  email: Joi.string().email().required(),
};

const resetPasswordSchema = {
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required(),
};

const changePasswordSchema = {
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required(),
};

module.exports = { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema };
