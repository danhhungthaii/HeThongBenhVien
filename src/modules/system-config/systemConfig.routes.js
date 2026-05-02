'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./systemConfig.controller');
const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { auth } = require('../../common/middlewares/auth');

router.get('/', auth, asyncHandler(controller.getAll));
router.put('/', auth, asyncHandler(controller.updateOne));
router.put('/bulk', auth, asyncHandler(controller.bulkUpdate));

module.exports = router;
