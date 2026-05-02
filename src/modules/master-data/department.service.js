'use strict';
const db = require('../../config/database');
const cache = require('../../common/services/cache.service');

async function getDepartments(filters = {}) {
  let items = db.findAll('departments');

  if (filters.is_active !== undefined) {
    items = items.filter(d => d.is_active === (filters.is_active === 'true' || filters.is_active === true));
  }
  if (filters.department_type) {
    items = items.filter(d => d.department_type === filters.department_type);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(d =>
      d.department_name.toLowerCase().includes(q) ||
      (d.department_code && d.department_code.toLowerCase().includes(q))
    );
  }

  return items;
}

async function getDepartmentById(id) {
  return db.findOne('departments', d => d.department_id === parseInt(id));
}

async function createDepartment(data) {
  const dept = {
    department_id: ++db.counters.department,
    department_code: data.department_code || null,
    department_name: data.department_name,
    department_type: data.department_type || null,
    head_doctor_id: data.head_doctor_id || null,
    floor: data.floor || null,
    is_active: true,
    created_at: new Date(),
  };
  return db.insert('departments', dept);
}

async function updateDepartment(id, changes) {
  const updated = db.update('departments', d => d.department_id === parseInt(id), changes);
  if (!updated.length) return null;
  return updated[0];
}

async function deleteDepartment(id) {
  return db.update('departments', d => d.department_id === parseInt(id), { is_active: false });
}

module.exports = { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
