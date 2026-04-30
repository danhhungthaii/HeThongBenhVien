'use strict';
const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { auth } = require('../../../common/middlewares/auth');

router.get('/', auth, asyncHandler(getAuditLogs));

module.exports = router;
