const { Router } = require('express');

const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { validateBody } = require('../../common/middlewares/validateBody');
const { queueController } = require('./queue.controller');
const { createQueueSchema } = require('./queue.dto');

const router = Router();

router.get('/', asyncHandler(queueController.list.bind(queueController)));
router.get('/:id', asyncHandler(queueController.getById.bind(queueController)));
router.post('/', validateBody(createQueueSchema), asyncHandler(queueController.create.bind(queueController)));
router.post('/next', asyncHandler(queueController.callNext.bind(queueController)));
router.patch('/:id/complete', asyncHandler(queueController.complete.bind(queueController)));

module.exports = router;