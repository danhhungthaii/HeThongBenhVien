const { Router } = require('express');

const { asyncHandler } = require('../../common/middlewares/asyncHandler');
const { validateBody } = require('../../common/middlewares/validateBody');
const { patientController } = require('./patient.controller');
const { createPatientSchema, updatePatientSchema } = require('./patient.dto');

const router = Router();

router.get('/', asyncHandler(patientController.list.bind(patientController)));
router.get('/:id', asyncHandler(patientController.getById.bind(patientController)));
router.post('/', validateBody(createPatientSchema), asyncHandler(patientController.create.bind(patientController)));
router.put('/:id', validateBody(updatePatientSchema), asyncHandler(patientController.update.bind(patientController)));
router.delete('/:id', asyncHandler(patientController.delete.bind(patientController)));

module.exports = router;