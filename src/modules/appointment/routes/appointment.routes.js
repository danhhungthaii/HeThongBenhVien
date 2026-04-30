'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointment.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { validate } = require('../../../common/middlewares/validate');
const { auth } = require('../../../common/middlewares/auth');

const createSchema = {
  patient_id: { required: true, type: 'string' },
  doctor_id: { required: true, type: 'number' },
  department_id: { required: false, type: 'number' },
  appointment_date: { required: true, type: 'string' },
  slot_time: { required: true, type: 'string' },
};

router.get('/', auth, asyncHandler(controller.listAppointments));
router.get('/available-slots', auth, asyncHandler(controller.getAvailableSlots));
router.get('/:id', auth, asyncHandler(controller.getAppointment));
router.post('/', auth, validate(createSchema), asyncHandler(controller.createAppointment));
router.put('/:id', auth, asyncHandler(controller.updateAppointment));
router.delete('/:id', auth, asyncHandler(controller.cancelAppointment));

module.exports = router;
