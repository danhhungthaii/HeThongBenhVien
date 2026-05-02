'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controllers/queue.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { auth } = require('../../../common/middlewares/auth');

router.get('/', auth, asyncHandler(controller.listTickets));
router.post('/', auth, asyncHandler(controller.createTicket));
router.post('/call-next', auth, asyncHandler(controller.callNext));
router.put('/:id/complete', auth, asyncHandler(controller.completeTicket));
router.put('/:id/skip', auth, asyncHandler(controller.skipTicket));
router.get('/waiting-count', auth, asyncHandler(controller.getWaitingCount));

module.exports = router;
