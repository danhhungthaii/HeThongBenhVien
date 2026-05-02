'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./encounter.controller');
const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { validate } = require('../../common/middlewares/validate');
const { auth } = require('../../common/middlewares/auth');

const createSchema = {
	patient_id: { required: true, type: 'string' },
	doctor_id: { required: true, type: 'number' },
	department_id: { required: false, type: 'number' },
	room_id: { required: false, type: 'string' },
	queue_number: { required: false, type: 'string' },
	patient_type: { required: false, type: 'string' },
	symptoms: { required: false, type: 'string' },
	visit_date: { required: false, type: 'date' },
};

const updateSchema = {
	doctor_id: { required: false, type: 'number' },
	department_id: { required: false, type: 'number' },
	visit_date: { required: false, type: 'date' },
	status: { required: false, type: 'string', enum: ['waiting', 'in_progress', 'waiting_for_results', 'completed'] },
};

const vitalsSchema = {
	temperature: { required: false, type: 'number' },
	heart_rate: { required: false, type: 'number' },
	respiratory_rate: { required: false, type: 'number' },
	spo2: { required: false, type: 'number' },
	weight: { required: false, type: 'number' },
	height: { required: false, type: 'number' },
	systolic: { required: false, type: 'number' },
	diastolic: { required: false, type: 'number' },
};

const diagnosisSchema = {
	icd10_code: { required: true, type: 'string' },
	description: { required: false, type: 'string' },
	type: { required: false, type: 'string', enum: ['primary', 'secondary', 'differential'] },
};

const clinicalNoteSchema = {
	note: { required: true, type: 'string', minLength: 1 },
	note_type: { required: false, type: 'string' },
};

router.get('/', auth, asyncHandler(controller.listEncounters));
router.get('/:id', auth, asyncHandler(controller.getEncounter));
router.post('/', auth, validate(createSchema), asyncHandler(controller.createEncounter));
router.put('/:id', auth, validate(updateSchema), asyncHandler(controller.updateEncounter));
router.put('/:id/vitals', auth, validate(vitalsSchema), asyncHandler(controller.addVitals));
router.put('/:id/diagnosis', auth, validate(diagnosisSchema), asyncHandler(controller.addDiagnosis));
router.post('/:id/notes', auth, validate(clinicalNoteSchema), asyncHandler(controller.addClinicalNote));
router.post('/:id/clinical-orders', auth, asyncHandler(controller.createClinicalOrder));
router.put('/:id/clinical-results', auth, asyncHandler(controller.receiveClinicalResults));
router.post('/:id/prescriptions', auth, asyncHandler(controller.addPrescription));
router.get('/:id/billing-payload', auth, asyncHandler(controller.getBillingPayload));
router.put('/:id/close', auth, asyncHandler(controller.closeEncounter));

module.exports = router;
