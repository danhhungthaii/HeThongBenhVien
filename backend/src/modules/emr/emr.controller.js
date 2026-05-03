'use strict';
const emrService = require('./emr.service');
const { NotFoundError } = require('../../common/errors/AppError');
const { successResponse } = require('../../common/helpers/responseHelper');

async function getHistory(req, res) {
  const history = await emrService.getPatientHistory(req.params.id);
  if (!history || history.total_encounters === 0) {
    return res.status(200).json(successResponse({ patient_id: req.params.id, total_encounters: 0, timeline: [] }));
  }
  res.status(200).json(successResponse(history));
}

async function getSummary(req, res) {
  const summary = await emrService.getPatientSummary(req.params.id);
  if (!summary) throw new NotFoundError('Patient');
  res.status(200).json(successResponse(summary));
}

module.exports = { getHistory, getSummary };
