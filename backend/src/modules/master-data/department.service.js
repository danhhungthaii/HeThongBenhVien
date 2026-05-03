'use strict';

// Departments table not in HeThongBV schema — stub
async function getDepartments() { return []; }
async function getDepartmentById() { return null; }
async function createDepartment() { return { message: 'Departments table not yet in database' }; }
async function updateDepartment() { return null; }
async function deleteDepartment() { return null; }

module.exports = { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
