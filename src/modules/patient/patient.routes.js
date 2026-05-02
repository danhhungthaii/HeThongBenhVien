'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./patient.controller');
const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { validate } = require('../../common/middlewares/validate');
const { auth } = require('../../common/middlewares/auth');

const createSchema = {
  full_name: { required: true, type: 'string' },
  phone: { required: false, type: 'string' },
  cccd: { required: false, type: 'string' },
};

router.get('/', auth, asyncHandler(controller.listPatients));
router.get('/:id', auth, asyncHandler(controller.getPatient));
router.post('/', auth, validate(createSchema), asyncHandler(controller.createPatient));
router.put('/:id', auth, asyncHandler(controller.updatePatient));
router.delete('/:id', auth, asyncHandler(controller.deletePatient));
router.post('/search-duplicates', auth, asyncHandler(controller.searchDuplicates));
router.post('/merge', auth, asyncHandler(controller.mergePatients));

module.exports = router;
