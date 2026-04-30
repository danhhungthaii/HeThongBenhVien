'use strict';
const queueService = require('../services/queue.service');
const { ValidationError } = require('../../../common/errors/AppError');
const { successResponse } = require('../../../common/helpers/responseHelper');

async function listTickets(req, res) {
  const items = await queueService.getTickets(req.query);
  res.status(200).json(successResponse(items));
}

async function createTicket(req, res) {
  const ticket = await queueService.createTicket(req.body);
  res.status(201).json(successResponse(ticket));
}

async function callNext(req, res) {
  const { department_id, doctor_id } = req.query;
  if (!department_id) throw new ValidationError('department_id is required');
  const ticket = await queueService.callNext(department_id, doctor_id);
  if (!ticket) {
    return res.status(200).json(successResponse({ message: 'No patients waiting' }));
  }
  res.status(200).json(successResponse(ticket));
}

async function completeTicket(req, res) {
  const ticket = await queueService.completeTicket(req.params.id);
  if (!ticket) throw new ValidationError('Ticket not found');
  res.status(200).json(successResponse(ticket));
}

async function skipTicket(req, res) {
  const ticket = await queueService.skipTicket(req.params.id);
  if (!ticket) throw new ValidationError('Ticket not found');
  res.status(200).json(successResponse(ticket));
}

async function getWaitingCount(req, res) {
  const { department_id } = req.query;
  if (!department_id) throw new ValidationError('department_id is required');
  const count = await queueService.getWaitingCount(department_id);
  res.status(200).json(successResponse({ waiting: count }));
}

module.exports = { listTickets, createTicket, callNext, completeTicket, skipTicket, getWaitingCount };
