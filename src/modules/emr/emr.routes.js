'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./emr.controller');
const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { auth } = require('../../common/middlewares/auth');

router.get('/patients/:id/history', auth, asyncHandler(controller.getHistory));
router.get('/patients/:id/summary', auth, asyncHandler(controller.getSummary));

module.exports = router;
