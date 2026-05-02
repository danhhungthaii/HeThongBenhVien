'use strict';
const encounterService = require('./encounter.service');
const auditService = require('../audit/audit.service');
const { NotFoundError, ValidationError } = require('../../common/errors/AppError');
const { successResponse } = require('../../common/helpers/responseHelper');

function validatePrescriptionPayload(payload) {
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ValidationError('Prescription items are required');
  }

  payload.items.forEach((item, index) => {
    if (!item.drug_id) {
      throw new ValidationError(`items[${index}].drug_id is required`);
    }
    if (!item.quantity || Number(item.quantity) <= 0) {
      throw new ValidationError(`items[${index}].quantity must be greater than 0`);
    }
  });
}

function validateClinicalNotePayload(payload) {
  if (!payload || !payload.note) {
    throw new ValidationError('note is required');
  }
}

function validateClinicalOrderPayload(payload) {
  const hasItems = Array.isArray(payload?.items) && payload.items.length > 0;
  const hasServiceIds = Array.isArray(payload?.service_ids) && payload.service_ids.length > 0;
  if (!hasItems && !hasServiceIds) {
    throw new ValidationError('Clinical order items are required');
  }
}

function validateClinicalResultsPayload(payload) {
  if (!payload || !Array.isArray(payload.results) || payload.results.length === 0) {
    throw new ValidationError('Clinical results are required');
  }
}

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
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  const item = await encounterService.updateEncounter(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(200).json(successResponse(item));
}

async function addVitals(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  const item = await encounterService.addVitals(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(200).json(successResponse(item));
}

async function addDiagnosis(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  const item = await encounterService.addDiagnosis(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(200).json(successResponse(item));
}

async function closeEncounter(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  const item = await encounterService.closeEncounter(req.params.id);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(200).json(successResponse(item));
}

async function addPrescription(req, res) {
  validatePrescriptionPayload(req.body);
  const item = await encounterService.addPrescription(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');
  res.status(201).json(successResponse(item));
}

async function addClinicalNote(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  validateClinicalNotePayload(req.body);
  const item = await encounterService.addClinicalNote(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(201).json(successResponse(item));
}

async function getBillingPayload(req, res) {
  const item = await encounterService.buildBillingPayload(req.params.id);
  if (!item) throw new NotFoundError('Encounter');
  res.status(200).json(successResponse(item));
}

async function createClinicalOrder(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  validateClinicalOrderPayload(req.body);
  const item = await encounterService.createClinicalOrder(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  const refreshed = await encounterService.getEncounterById(req.params.id);
  if (refreshed && before.status !== refreshed.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: refreshed.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: refreshed.status },
      req,
    });
  }

  res.status(201).json(successResponse(item));
}

async function receiveClinicalResults(req, res) {
  const before = await encounterService.getEncounterById(req.params.id);
  if (!before) throw new NotFoundError('Encounter');

  validateClinicalResultsPayload(req.body);
  const item = await encounterService.receiveClinicalResults(req.params.id, req.body);
  if (!item) throw new NotFoundError('Encounter');

  if (before.status !== item.status) {
    await auditService.logAudit({
      userId: req.user?.userId,
      action: 'status_change',
      resource: 'encounter',
      resourceId: item.encounter_id,
      oldValue: { status: before.status },
      newValue: { status: item.status },
      req,
    });
  }

  res.status(200).json(successResponse(item));
}

module.exports = {
  listEncounters,
  getEncounter,
  createEncounter,
  updateEncounter,
  addVitals,
  addDiagnosis,
  addClinicalNote,
  createClinicalOrder,
  receiveClinicalResults,
  getBillingPayload,
  addPrescription,
  closeEncounter,
};
