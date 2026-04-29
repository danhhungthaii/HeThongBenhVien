import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { prescriptionController } from './prescription.controller';
import { createPrescriptionSchema } from './prescription.dto';

const router = Router();

router.get('/', asyncHandler(prescriptionController.list.bind(prescriptionController)));
router.post('/', validateBody(createPrescriptionSchema), asyncHandler(prescriptionController.create.bind(prescriptionController)));

export default router;
