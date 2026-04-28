import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { appointmentController } from './appointment.controller';
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.dto';

const router = Router();

router.get('/', asyncHandler(appointmentController.list.bind(appointmentController)));
router.get('/:id', asyncHandler(appointmentController.getById.bind(appointmentController)));
router.post('/', validateBody(createAppointmentSchema), asyncHandler(appointmentController.create.bind(appointmentController)));
router.put('/:id', validateBody(updateAppointmentSchema), asyncHandler(appointmentController.update.bind(appointmentController)));
router.delete('/:id', asyncHandler(appointmentController.delete.bind(appointmentController)));

export default router;
