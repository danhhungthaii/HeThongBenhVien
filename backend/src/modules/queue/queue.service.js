'use strict';

/**
 * queue.service.js — SQL Server implementation
 * Table: Queue (Queue_ID, Patient_ID, Queue_Number, Status, ETA_Minutes, Department, Visit_Type, Priority, Created_At)
 */
const { poolPromise, sql } = require('../../database/database.real');

async function getPool() {
  return poolPromise;
}

async function getQueueTickets(filters = {}) {
  const pool = await getPool();
  const req = pool.request();
  let where = '1=1';

  if (filters.status) {
    req.input('status', sql.VarChar(20), filters.status);
    where += ' AND q.Status = @status';
  }
  if (filters.department) {
    req.input('department', sql.NVarChar(50), filters.department);
    where += ' AND q.Department = @department';
  }
  if (filters.patient_id) {
    req.input('patientId', sql.UniqueIdentifier, filters.patient_id);
    where += ' AND q.Patient_ID = @patientId';
  }

  const result = await req.query(`
    SELECT q.*, p.Full_Name AS patient_name
    FROM Queue q
    LEFT JOIN Patients p ON q.Patient_ID = p.Patient_ID
    WHERE ${where}
    ORDER BY q.Priority DESC, q.Created_At ASC
  `);
  return result.recordset.map(mapTicket);
}

async function getQueueTicketById(ticketId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ticketId', sql.Int, ticketId)
    .query(`
      SELECT q.*, p.Full_Name AS patient_name
      FROM Queue q
      LEFT JOIN Patients p ON q.Patient_ID = p.Patient_ID
      WHERE q.Queue_ID = @ticketId
    `);
  if (!result.recordset[0]) return null;
  return mapTicket(result.recordset[0]);
}

async function createQueueTicket(data) {
  const pool = await getPool();

  // Auto-generate queue number: Q001, Q002,...
  const countRes = await pool.request().query(`SELECT COUNT(*) AS cnt FROM Queue WHERE CAST(Created_At AS DATE) = CAST(GETDATE() AS DATE)`);
  const nextNum = String(countRes.recordset[0].cnt + 1).padStart(3, '0');
  const queueNumber = `Q${nextNum}`;

  const result = await pool.request()
    .input('patientId', sql.UniqueIdentifier, data.patient_id)
    .input('queueNumber', sql.NVarChar(20), queueNumber)
    .input('status', sql.VarChar(20), 'waiting')
    .input('department', sql.NVarChar(50), data.department || null)
    .input('visitType', sql.NVarChar(20), data.visit_type || 'outpatient')
    .input('priority', sql.Bit, data.priority ? 1 : 0)
    .input('etaMinutes', sql.Int, data.eta_minutes || null)
    .query(`
      INSERT INTO Queue (Patient_ID, Queue_Number, Status, Department, Visit_Type, Priority, ETA_Minutes, Created_At)
      OUTPUT INSERTED.*
      VALUES (@patientId, @queueNumber, @status, @department, @visitType, @priority, @etaMinutes, GETDATE())
    `);
  return mapTicket(result.recordset[0]);
}

async function updateQueueTicket(ticketId, changes) {
  const pool = await getPool();
  const req = pool.request().input('ticketId', sql.Int, ticketId);
  const sets = [];

  if (changes.status !== undefined) { req.input('status', sql.VarChar(20), changes.status); sets.push('Status = @status'); }
  if (changes.eta_minutes !== undefined) { req.input('etaMinutes', sql.Int, changes.eta_minutes); sets.push('ETA_Minutes = @etaMinutes'); }
  if (changes.department !== undefined) { req.input('department', sql.NVarChar(50), changes.department); sets.push('Department = @department'); }

  if (sets.length === 0) return getQueueTicketById(ticketId);

  await req.query(`UPDATE Queue SET ${sets.join(', ')} WHERE Queue_ID = @ticketId`);
  return getQueueTicketById(ticketId);
}

async function callNextTicket(department) {
  const pool = await getPool();
  const req = pool.request().input('status', sql.VarChar(20), 'waiting');
  let query = `SELECT TOP 1 Queue_ID FROM Queue WHERE Status = @status`;
  if (department) {
    req.input('department', sql.NVarChar(50), department);
    query += ` AND Department = @department`;
  }
  query += ` ORDER BY Priority DESC, Created_At ASC`;
  const result = await req.query(query);
  if (!result.recordset[0]) return null;

  const ticketId = result.recordset[0].Queue_ID;
  return updateQueueTicket(ticketId, { status: 'serving' });
}

function mapTicket(row) {
  if (!row) return null;
  return {
    Ticket_ID: row.Queue_ID,
    Queue_Number: row.Queue_Number,
    Patient_ID: row.Patient_ID,
    Full_Name: row.patient_name || null,
    Status: row.Status,
    ETA_Minutes: row.ETA_Minutes,
    Department: row.Department,
    Visit_Type: row.Visit_Type,
    Priority: row.Priority,
    Created_At: row.Created_At,
  };
}

module.exports = {
  getQueueTickets,
  getQueueTicketById,
  createQueueTicket,
  updateQueueTicket,
  callNextTicket,
};
