'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controllers/encounter.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { auth } = require('../../../common/middlewares/auth');

router.get('/', auth, asyncHandler(controller.listEncounters));
router.get('/:id', auth, asyncHandler(controller.getEncounter));
router.post('/', auth, asyncHandler(controller.createEncounter));
router.put('/:id', auth, asyncHandler(controller.updateEncounter));
router.put('/:id/vitals', auth, asyncHandler(controller.addVitals));
router.put('/:id/diagnosis', auth, asyncHandler(controller.addDiagnosis));
router.put('/:id/close', auth, asyncHandler(controller.closeEncounter));

module.exports = router;
