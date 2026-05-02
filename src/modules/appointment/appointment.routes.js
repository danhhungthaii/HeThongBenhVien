const { Router } = require('express');

const { asyncHandler } = require('../../common/middleware/asyncHandler');
const { validateBody } = require('../../common/validation/validateBody');
const { appointmentController } = require('./appointment.controller');
const { createAppointmentSchema, updateAppointmentSchema } = require('./appointment.dto');

const router = Router();

router.get('/', asyncHandler(appointmentController.list.bind(appointmentController)));
router.get('/:id', asyncHandler(appointmentController.getById.bind(appointmentController)));
router.post('/', validateBody(createAppointmentSchema), asyncHandler(appointmentController.create.bind(appointmentController)));
router.put('/:id', validateBody(updateAppointmentSchema), asyncHandler(appointmentController.update.bind(appointmentController)));
router.delete('/:id', asyncHandler(appointmentController.delete.bind(appointmentController)));

module.exports = router;