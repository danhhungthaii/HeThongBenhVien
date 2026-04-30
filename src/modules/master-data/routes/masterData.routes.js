'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../controllers/masterData.controller');
const { asyncHandler } = require('../../../common/middlewares/asyncHandler');
const { validate } = require('../../../common/middlewares/validate');
const { auth } = require('../../../common/middlewares/auth');

const deptSchema = { department_name: { required: true, type: 'string' } };
const serviceSchema = { service_name: { required: true, type: 'string' }, service_code: { required: true, type: 'string' } };
const icdSchema = { code: { required: true, type: 'string' }, description_vn: { required: true, type: 'string' } };
const doctorSchema = { specialty: { required: true, type: 'string' } };

router.get('/departments', auth, asyncHandler(controller.listDepartments));
router.get('/departments/:id', auth, asyncHandler(controller.getDepartment));
router.post('/departments', auth, validate(deptSchema), asyncHandler(controller.createDepartment));
router.put('/departments/:id', auth, validate(deptSchema), asyncHandler(controller.updateDepartment));
router.delete('/departments/:id', auth, asyncHandler(controller.deleteDepartment));

router.get('/services', auth, asyncHandler(controller.listServices));
router.get('/services/:id', auth, asyncHandler(controller.getService));
router.post('/services', auth, validate(serviceSchema), asyncHandler(controller.createService));
router.put('/services/:id', auth, validate(serviceSchema), asyncHandler(controller.updateService));

router.get('/icd10/search', auth, asyncHandler(controller.searchIcd10));
router.get('/icd10/:id', auth, asyncHandler(controller.getIcd10));
router.post('/icd10', auth, validate(icdSchema), asyncHandler(controller.createIcd10));

router.get('/doctors', auth, asyncHandler(controller.listDoctors));
router.get('/doctors/:id', auth, asyncHandler(controller.getDoctor));
router.post('/doctors', auth, validate(doctorSchema), asyncHandler(controller.createDoctor));
router.put('/doctors/:id', auth, validate(doctorSchema), asyncHandler(controller.updateDoctor));

module.exports = router;
