'use strict';
const db = require('../../../config/database');

async function getDoctors(filters = {}) {
  let items = db.findAll('doctors');

  if (filters.department_id) {
    items = items.filter(d => d.department_id === parseInt(filters.department_id));
  }
  if (filters.specialty) {
    const q = filters.specialty.toLowerCase();
    items = items.filter(d => d.specialty && d.specialty.toLowerCase().includes(q));
  }
  if (filters.is_active !== undefined) {
    items = items.filter(d => d.is_active === (filters.is_active === 'true'));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(d =>
      (d.specialty && d.specialty.toLowerCase().includes(q)) ||
      (d.license_number && d.license_number.toLowerCase().includes(q))
    );
  }

  return items;
}

async function getDoctorById(id) {
  return db.findOne('doctors', d => d.doctor_id === parseInt(id));
}

async function createDoctor(data) {
  const doctor = {
    doctor_id: ++db.counters.doctor,
    staff_id: data.staff_id || null,
    specialty: data.specialty || null,
    license_number: data.license_number || null,
    license_expiry: data.license_expiry || null,
    is_active: true,
    created_at: new Date(),
  };
  return db.insert('doctors', doctor);
}

async function updateDoctor(id, changes) {
  const updated = db.update('doctors', d => d.doctor_id === parseInt(id), changes);
  if (!updated.length) return null;
  return updated[0];
}

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor };
