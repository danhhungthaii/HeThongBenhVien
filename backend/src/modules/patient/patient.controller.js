'use strict';
const patientService = require('./patient.service');
const { NotFoundError } = require('../../common/errors/AppError');
const { successResponse } = require('../../common/helpers/responseHelper');

async function listPatients(req, res) {
  const items = await patientService.getPatients(req.query);
  res.status(200).json(successResponse(items));
}

async function getPatient(req, res) {
  const patient = await patientService.getPatientById(req.params.id);
  if (!patient) throw new NotFoundError('Patient');
  res.status(200).json(successResponse(patient));
}

async function createPatient(req, res) {
  if (req.body.phone || req.body.cccd) {
    const duplicates = await patientService.findDuplicates(req.body);
    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_DETECTED',
          message: 'Possible duplicate patient records found',
          details: duplicates,
        },
      });
    }
  }
  const patient = await patientService.createPatient(req.body);
  res.status(201).json(successResponse(patient));
}

async function updatePatient(req, res) {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  if (!patient) throw new NotFoundError('Patient');
  res.status(200).json(successResponse(patient));
}

async function deletePatient(req, res) {
  const patient = await patientService.getPatientById(req.params.id);
  if (!patient) throw new NotFoundError('Patient');
  await patientService.deletePatient(req.params.id);
  res.status(200).json(successResponse({ message: 'Patient deactivated' }));
}

async function searchDuplicates(req, res) {
  const duplicates = await patientService.findDuplicates(req.body);
  res.status(200).json(successResponse(duplicates));
}

async function mergePatients(req, res) {
  const { target_id, source_id } = req.body;
  const merged = await patientService.mergePatients(target_id, source_id);
  res.status(200).json(successResponse(merged));
}

module.exports = { listPatients, getPatient, createPatient, updatePatient, deletePatient, searchDuplicates, mergePatients };
