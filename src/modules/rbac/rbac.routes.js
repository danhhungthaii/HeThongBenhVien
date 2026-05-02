'use strict';
const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { auth } = require('../../../common/middlewares/auth');

router.get('/roles', auth, asyncHandler(rbacController.getRoles));
router.get('/permissions', auth, asyncHandler(rbacController.getPermissions));
router.get('/my-permissions', auth, asyncHandler(rbacController.getMyPermissions));

module.exports = router;
