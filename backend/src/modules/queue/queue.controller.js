'use strict';
const queueService = require('./queue.service');
const { ValidationError } = require('../../common/errors/AppError');
const { successResponse } = require('../../common/helpers/responseHelper');

async function listTickets(req, res) {
  const items = await queueService.getQueueTickets(req.query);
  res.status(200).json(successResponse(items));
}

async function createTicket(req, res) {
  const ticket = await queueService.createQueueTicket(req.body);
  res.status(201).json(successResponse(ticket));
}

async function callNext(req, res) {
  const { department_id, doctor_id } = req.query;
  if (!department_id) throw new ValidationError('department_id is required');
  const ticket = await queueService.callNextTicket(department_id);
  if (!ticket) {
    return res.status(200).json(successResponse({ message: 'No patients waiting' }));
  }
  res.status(200).json(successResponse(ticket));
}

async function completeTicket(req, res) {
  const ticket = await queueService.updateQueueTicket(req.params.id, { status: 'completed' });
  if (!ticket) throw new ValidationError('Ticket not found');
  res.status(200).json(successResponse(ticket));
}

async function skipTicket(req, res) {
  const ticket = await queueService.updateQueueTicket(req.params.id, { status: 'skipped' });
  if (!ticket) throw new ValidationError('Ticket not found');
  res.status(200).json(successResponse(ticket));
}

async function getWaitingCount(req, res) {
  const { department_id } = req.query;
  if (!department_id) throw new ValidationError('department_id is required');
  const tickets = await queueService.getQueueTickets({ department: department_id, status: 'waiting' });
  res.status(200).json(successResponse({ waiting: tickets.length }));
}

module.exports = { listTickets, createTicket, callNext, completeTicket, skipTicket, getWaitingCount };
