import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { encounterController } from './encounter.controller';
import { createEncounterSchema } from './encounter.dto';

const router = Router();

router.get('/', asyncHandler(encounterController.list.bind(encounterController)));
router.get('/:id', asyncHandler(encounterController.getById.bind(encounterController)));
router.post('/', validateBody(createEncounterSchema), asyncHandler(encounterController.create.bind(encounterController)));

export default router;
