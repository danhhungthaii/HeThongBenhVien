import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { createPatientSchema, updatePatientSchema } from './patient.dto';
import { patientController } from './patient.controller';

const router = Router();

router.get('/', asyncHandler(patientController.list.bind(patientController)));
router.get('/:id', asyncHandler(patientController.getById.bind(patientController)));
router.post('/', validateBody(createPatientSchema), asyncHandler(patientController.create.bind(patientController)));
router.put('/:id', validateBody(updatePatientSchema), asyncHandler(patientController.update.bind(patientController)));
router.delete('/:id', asyncHandler(patientController.delete.bind(patientController)));

export default router;
