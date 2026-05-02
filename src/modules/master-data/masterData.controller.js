'use strict';
const departmentService = require('./department.service');
const serviceCatalogService = require('./serviceCatalog.service');
const icd10Service = require('./icd10.service');
const doctorService = require('./doctor.service');
const { successResponse } = require('../../common/helpers/responseHelper');

async function listDepartments(req, res) {
  const items = await departmentService.getDepartments(req.query);
  res.status(200).json(successResponse(items));
}

async function getDepartment(req, res) {
  const item = await departmentService.getDepartmentById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Department not found' } });
  res.status(200).json(successResponse(item));
}

async function createDepartment(req, res) {
  const item = await departmentService.createDepartment(req.body);
  res.status(201).json(successResponse(item));
}

async function updateDepartment(req, res) {
  const item = await departmentService.updateDepartment(req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Department not found' } });
  res.status(200).json(successResponse(item));
}

async function deleteDepartment(req, res) {
  await departmentService.deleteDepartment(req.params.id);
  res.status(200).json(successResponse({ message: 'Department deactivated' }));
}

async function listServices(req, res) {
  const items = await serviceCatalogService.getServices(req.query);
  res.status(200).json(successResponse(items));
}

async function getService(req, res) {
  const item = await serviceCatalogService.getServiceById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
  res.status(200).json(successResponse(item));
}

async function createService(req, res) {
  const item = await serviceCatalogService.createService(req.body);
  res.status(201).json(successResponse(item));
}

async function updateService(req, res) {
  const item = await serviceCatalogService.updateService(req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
  res.status(200).json(successResponse(item));
}

async function searchIcd10(req, res) {
  const items = await icd10Service.searchIcd10(req.query.q, req.query);
  res.status(200).json(successResponse(items));
}

async function getIcd10(req, res) {
  const item = await icd10Service.getIcd10ById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'ICD-10 code not found' } });
  res.status(200).json(successResponse(item));
}

async function createIcd10(req, res) {
  const item = await icd10Service.createIcd10(req.body);
  if (!item) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'ICD-10 code already exists' } });
  res.status(201).json(successResponse(item));
}

async function listDoctors(req, res) {
  const items = await doctorService.getDoctors(req.query);
  res.status(200).json(successResponse(items));
}

async function getDoctor(req, res) {
  const item = await doctorService.getDoctorById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Doctor not found' } });
  res.status(200).json(successResponse(item));
}

async function createDoctor(req, res) {
  const item = await doctorService.createDoctor(req.body);
  res.status(201).json(successResponse(item));
}

async function updateDoctor(req, res) {
  const item = await doctorService.updateDoctor(req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Doctor not found' } });
  res.status(200).json(successResponse(item));
}

module.exports = {
  listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment,
  listServices, getService, createService, updateService,
  searchIcd10, getIcd10, createIcd10,
  listDoctors, getDoctor, createDoctor, updateDoctor,
};
