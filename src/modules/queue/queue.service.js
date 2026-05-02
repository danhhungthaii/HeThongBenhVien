'use strict';
const db = require('../../config/database');
const { QUEUE_STATUS, QUEUE_PRIORITY } = require('../../common/constants');

async function getTickets(filters = {}) {
  let items = db.findAll('queueTickets');

  if (filters.department_id) items = items.filter(t => t.department_id === parseInt(filters.department_id));
  if (filters.doctor_id) items = items.filter(t => t.doctor_id === parseInt(filters.doctor_id));
  if (filters.status) items = items.filter(t => t.status === filters.status);
  if (filters.priority) items = items.filter(t => t.priority === filters.priority);
  if (filters.date) {
    const d = filters.date.split('T')[0];
    items = items.filter(t => t.created_at && t.created_at.toISOString().split('T')[0] === d);
  }

  return items.sort((a, b) => {
    const priorityOrder = { emergency: 0, priority: 1, normal: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.created_at) - new Date(b.created_at);
  });
}

async function createTicket(data) {
  const today = new Date().toISOString().split('T')[0];
  const todayTickets = db.findMany('queueTickets', t =>
    t.created_at && t.created_at.toISOString().split('T')[0] === today
  );
  const nextNum = String(todayTickets.length + 1).padStart(3, '0');
  const ticketNumber = `Q${nextNum}`;

  const ticket = {
    ticket_id: ++db.counters.queueTicket,
    ticket_number: ticketNumber,
    patient_id: data.patient_id || null,
    doctor_id: data.doctor_id || null,
    department_id: data.department_id || null,
    priority: data.priority || QUEUE_PRIORITY.NORMAL,
    status: QUEUE_STATUS.WAITING,
    created_at: new Date(),
    called_at: null,
    completed_at: null,
  };
  return db.insert('queueTickets', ticket);
}

async function callNext(departmentId, doctorId) {
  const waiting = db.findMany('queueTickets', t =>
    t.department_id === parseInt(departmentId) &&
    t.status === QUEUE_STATUS.WAITING
  ).sort((a, b) => {
    const po = { emergency: 0, priority: 1, normal: 2 };
    const pd = po[a.priority] - po[b.priority];
    if (pd !== 0) return pd;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  if (waiting.length === 0) return null;

  const next = waiting[0];
  db.update('queueTickets', t => t.ticket_id === next.ticket_id, {
    status: QUEUE_STATUS.CALLED,
    doctor_id: doctorId || next.doctor_id,
    called_at: new Date(),
  });
  return db.findOne('queueTickets', t => t.ticket_id === next.ticket_id);
}

async function completeTicket(ticketId) {
  const updated = db.update('queueTickets', t => t.ticket_id === parseInt(ticketId), {
    status: QUEUE_STATUS.COMPLETED,
    completed_at: new Date(),
  });
  return updated[0] || null;
}

async function skipTicket(ticketId) {
  const updated = db.update('queueTickets', t => t.ticket_id === parseInt(ticketId), {
    status: QUEUE_STATUS.SKIPPED,
  });
  return updated[0] || null;
}

async function getWaitingCount(departmentId) {
  return db.count('queueTickets', t =>
    t.department_id === parseInt(departmentId) &&
    [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED].includes(t.status)
  );
}

module.exports = { getTickets, createTicket, callNext, completeTicket, skipTicket, getWaitingCount };
