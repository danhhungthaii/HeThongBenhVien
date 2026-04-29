import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { diagnosisController } from './diagnosis.controller';
import { createDiagnosisSchema } from './diagnosis.dto';

const router = Router();

router.get('/', asyncHandler(diagnosisController.list.bind(diagnosisController)));
router.post('/', validateBody(createDiagnosisSchema), asyncHandler(diagnosisController.create.bind(diagnosisController)));

export default router;
