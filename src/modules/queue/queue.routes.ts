import { Router } from 'express';

import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validateBody } from '../../common/validation/validateBody';
import { queueController } from './queue.controller';
import { createQueueSchema } from './queue.dto';

const router = Router();

router.get('/', asyncHandler(queueController.list.bind(queueController)));
router.get('/:id', asyncHandler(queueController.getById.bind(queueController)));
router.post('/', validateBody(createQueueSchema), asyncHandler(queueController.create.bind(queueController)));
router.post('/next', asyncHandler(queueController.callNext.bind(queueController)));
router.patch('/:id/complete', asyncHandler(queueController.complete.bind(queueController)));

export default router;
