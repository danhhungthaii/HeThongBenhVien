'use strict';

// Doctors table not in HeThongBV schema — stub
async function getDoctors() { return []; }
async function getDoctorById() { return null; }
async function createDoctor() { return { message: 'Doctors table not yet in database' }; }
async function updateDoctor() { return null; }
async function deleteDoctor() { return null; }

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
