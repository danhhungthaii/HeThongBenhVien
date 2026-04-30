'use strict';
const encounterService = require('../services/encounter.service');
const { NotFoundError, ValidationError } = require('../../../common/errors/AppError');
const { successResponse } = require('../../../common/helpers/responseHelper');

async function listEncounters(req, res) {
  const items = await encounterService.getEncounters(req.query);
  res.status(200).json(successResponse(items));
}

async function getEncounter(req, res) {
  const item = await encounterService.getEncounterById(req.params.id);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

async function createEncounter(req, res) {
  if (!req.body.patient_id || !req.body.doctor_id) {
    throw new ValidationError('patient_id and doctor_id are required');
  }
  const item = await encounterService.createEncounter(req.body);
  res.status(201).json(successResponse(item));
}

async function updateEncounter(req, res) {
  const item = await encounterService.updateEncounter(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

async function addVitals(req, res) {
  const item = await encounterService.addVitals(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

async function addDiagnosis(req, res) {
  const item = await encounterService.addDiagnosis(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

async function closeEncounter(req, res) {
  const item = await encounterService.closeEncounter(req.params.id);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

module.exports = { listEncounters, getEncounter, createEncounter, updateEncounter, addVitals, addDiagnosis, closeEncounter };
