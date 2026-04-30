'use strict';
const appointmentService = require('../services/appointment.service');
const { NotFoundError, ValidationError } = require('../../../common/errors/AppError');
const { successResponse } = require('../../../common/helpers/responseHelper');

async function listAppointments(req, res) {
  const items = await appointmentService.getAppointments(req.query);
  res.status(200).json(successResponse(items));
}

async function getAppointment(req, res) {
  const item = await appointmentService.getAppointmentById(req.params.id);
  if (!item) throw new NotFoundError('Appointment');
  res.status(200).json(successResponse(item));
}

async function createAppointment(req, res) {
  const result = await appointmentService.createAppointment(req.body);
  if (result.conflict) {
    throw new ValidationError(result.message);
  }
  res.status(201).json(successResponse(result));
}

async function updateAppointment(req, res) {
  const item = await appointmentService.updateAppointment(req.params.id, req.body);
  if (!item) throw new NotFoundError('Appointment');
  res.status(200).json(successResponse(item));
}

async function cancelAppointment(req, res) {
  const item = await appointmentService.cancelAppointment(req.params.id, req.body.reason);
  if (!item) throw new NotFoundError('Appointment');
  res.status(200).json(successResponse(item));
}

async function getAvailableSlots(req, res) {
  const { doctor_id, date } = req.query;
  if (!doctor_id || !date) throw new ValidationError('doctor_id and date are required');
  const slots = await appointmentService.getAvailableSlots(doctor_id, date);
  res.status(200).json(successResponse(slots));
}

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, cancelAppointment, getAvailableSlots };
