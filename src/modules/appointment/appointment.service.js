'use strict';
const db = require('../../config/database');
const { APPOINTMENT_STATUS } = require('../../common/constants');

async function getAppointments(filters = {}) {
  let items = db.findAll('appointments');

  if (filters.patient_id) items = items.filter(a => a.patient_id === filters.patient_id);
  if (filters.doctor_id) items = items.filter(a => a.doctor_id === parseInt(filters.doctor_id));
  if (filters.department_id) items = items.filter(a => a.department_id === parseInt(filters.department_id));
  if (filters.status) items = items.filter(a => a.status === filters.status);
  if (filters.appointment_date) items = items.filter(a => a.appointment_date === filters.appointment_date);
  if (filters.from_date) items = items.filter(a => a.appointment_date >= filters.from_date);
  if (filters.to_date) items = items.filter(a => a.appointment_date <= filters.to_date);

  return items.sort((a, b) => new Date(a.appointment_date + 'T' + a.slot_time) - new Date(b.appointment_date + 'T' + b.slot_time));
}

async function getAppointmentById(id) {
  return db.findOne('appointments', a => a.appointment_id === parseInt(id));
}

async function createAppointment(data) {
  // Conflict detection
  const existing = db.findMany('appointments', a =>
    a.doctor_id === data.doctor_id &&
    a.appointment_date === data.appointment_date &&
    a.slot_time === data.slot_time &&
    [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(a.status)
  );
  if (existing.length > 0) {
    return { conflict: true, message: 'Slot already booked' };
  }

  const appointment = {
    appointment_id: ++db.counters.appointment,
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    department_id: data.department_id,
    appointment_date: data.appointment_date,
    slot_time: data.slot_time,
    status: APPOINTMENT_STATUS.PENDING,
    notes: data.notes || null,
    created_by: data.created_by || null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return db.insert('appointments', appointment);
}

async function updateAppointment(id, changes) {
  const updated = db.update('appointments', a => a.appointment_id === parseInt(id), changes);
  if (!updated.length) return null;
  return updated[0];
}

async function getAvailableSlots(doctorId, date) {
  const booked = db.findMany('appointments', a =>
    a.doctor_id === parseInt(doctorId) &&
    a.appointment_date === date &&
    [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(a.status)
  );
  const bookedTimes = new Set(booked.map(a => a.slot_time));

  const allSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00',
  ];

  return allSlots.map(time => ({ time, available: !bookedTimes.has(time) }));
}

async function cancelAppointment(id, reason) {
  return updateAppointment(id, {
    status: APPOINTMENT_STATUS.CANCELLED,
    notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
  });
}

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointment, getAvailableSlots, cancelAppointment };
