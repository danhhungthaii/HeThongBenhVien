'use strict';
// Appointments table not in HeThongBV schema — stub (keeps API alive)

async function getAppointments() { return []; }
async function getAppointmentById() { return null; }
async function createAppointment() { return { message: 'Appointments table not yet in database' }; }
async function updateAppointment() { return null; }
async function getAvailableSlots(doctorId, date) {
  const slots = [
    '07:00','07:30','08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00','11:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00',
  ];
  return slots.map(time => ({ time, available: true }));
}
async function cancelAppointment() { return null; }

module.exports = { getAppointments, getAppointmentById, createAppointment, updateAppointment, getAvailableSlots, cancelAppointment };
