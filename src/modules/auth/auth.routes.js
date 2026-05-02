'use strict';
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { validate } = require('../../common/middlewares/validate');
const authValidator = require('./auth.validator');
const { rateLimiter } = require('../../common/middlewares/rateLimiter');
const { auth } = require('../../common/middlewares/auth');

router.post('/login', rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), validate(authValidator.loginSchema), asyncHandler(authController.login));
router.post('/logout', auth, asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/forgot-password', validate(authValidator.forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate(authValidator.resetPasswordSchema), asyncHandler(authController.resetPassword));
router.get('/profile', auth, asyncHandler(authController.getProfile));

module.exports = router;
