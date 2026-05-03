'use strict';

/**
 * patient.service.js — SQL Server implementation
 * Table: Patients (Patient_ID uniqueidentifier, Full_Name, Gender, Birth_Date, Phone, National_ID, Created_At)
 */
const { poolPromise, sql } = require('../../database/database.real');

async function getPool() {
  return poolPromise;
}

async function getPatients(filters = {}) {
  const pool = await getPool();
  const req = pool.request();

  let where = '1=1';

  if (filters.search) {
    req.input('search', sql.NVarChar(100), `%${filters.search}%`);
    where += ' AND (p.Full_Name LIKE @search OR p.Phone LIKE @search OR CAST(p.Patient_ID AS NVARCHAR(50)) LIKE @search OR p.National_ID LIKE @search)';
  }
  if (filters.gender) {
    req.input('gender', sql.NVarChar(20), filters.gender);
    where += ' AND p.Gender = @gender';
  }

  const result = await req.query(`
    SELECT p.*, pa.Allergy_Name
    FROM Patients p
    LEFT JOIN Patient_Allergies pa ON p.Patient_ID = pa.Patient_ID
    WHERE ${where}
    ORDER BY p.Created_At DESC
  `);
  return result.recordset.map(mapPatient);
}

async function getPatientById(patientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('patientId', sql.UniqueIdentifier, patientId)
    .query(`
      SELECT p.*, pa.Allergy_Name
      FROM Patients p
      LEFT JOIN Patient_Allergies pa ON p.Patient_ID = pa.Patient_ID
      WHERE p.Patient_ID = @patientId
    `);
  if (!result.recordset[0]) return null;
  return mapPatient(result.recordset[0]);
}

async function createPatient(data) {
  const pool = await getPool();

  const result = await pool.request()
    .input('fullName', sql.NVarChar(100), data.full_name)
    .input('gender', sql.NVarChar(20), data.gender || 'unknown')
    .input('birthDate', sql.Date, data.dob || null)
    .input('phone', sql.NVarChar(20), data.phone || null)
    .input('nationalId', sql.NVarChar(30), data.cccd || data.national_id || null)
    .query(`
      INSERT INTO Patients (Patient_ID, Full_Name, Gender, Birth_Date, Phone, National_ID, Created_At)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @fullName, @gender, @birthDate, @phone, @nationalId, GETDATE())
    `);

  const patient = result.recordset[0];

  // Insert allergy if provided
  if (data.allergy && patient) {
    await pool.request()
      .input('patientId', sql.UniqueIdentifier, patient.Patient_ID)
      .input('allergy', sql.NVarChar(255), data.allergy)
      .query(`INSERT INTO Patient_Allergies (Patient_ID, Allergy_Name) VALUES (@patientId, @allergy)`);
  }

  return mapPatient(patient);
}

async function updatePatient(patientId, changes) {
  const pool = await getPool();
  const req = pool.request().input('patientId', sql.UniqueIdentifier, patientId);
  const sets = [];

  if (changes.full_name !== undefined) { req.input('fullName', sql.NVarChar(100), changes.full_name); sets.push('Full_Name = @fullName'); }
  if (changes.gender !== undefined) { req.input('gender', sql.NVarChar(20), changes.gender); sets.push('Gender = @gender'); }
  if (changes.dob !== undefined) { req.input('birthDate', sql.Date, changes.dob); sets.push('Birth_Date = @birthDate'); }
  if (changes.phone !== undefined) { req.input('phone', sql.NVarChar(20), changes.phone); sets.push('Phone = @phone'); }
  if (changes.cccd !== undefined) { req.input('nationalId', sql.NVarChar(30), changes.cccd); sets.push('National_ID = @nationalId'); }

  if (sets.length === 0) return getPatientById(patientId);

  await req.query(`UPDATE Patients SET ${sets.join(', ')} WHERE Patient_ID = @patientId`);
  return getPatientById(patientId);
}

async function deletePatient(patientId) {
  const pool = await getPool();
  await pool.request()
    .input('patientId', sql.UniqueIdentifier, patientId)
    .query(`DELETE FROM Patients WHERE Patient_ID = @patientId`);
  return { deleted: true };
}

async function findDuplicates(data) {
  const pool = await getPool();
  const req = pool.request();
  let where = '1=0';
  if (data.phone) { req.input('phone', sql.NVarChar(20), data.phone); where += ' OR Phone = @phone'; }
  if (data.cccd) { req.input('nationalId', sql.NVarChar(30), data.cccd); where += ' OR National_ID = @nationalId'; }

  const result = await req.query(`SELECT * FROM Patients WHERE ${where}`);
  return result.recordset.map(r => ({ patient: mapPatient(r), match_score: 3 }));
}

async function mergePatients(targetPid, sourcePid) {
  // Move queue & encounters from source to target then delete source
  const pool = await getPool();
  await pool.request()
    .input('targetPid', sql.UniqueIdentifier, targetPid)
    .input('sourcePid', sql.UniqueIdentifier, sourcePid)
    .query(`
      UPDATE Queue SET Patient_ID = @targetPid WHERE Patient_ID = @sourcePid;
      UPDATE M2_Encounters SET Patient_ID = @targetPid WHERE Patient_ID = @sourcePid;
      DELETE FROM Patients WHERE Patient_ID = @sourcePid;
    `);
  return getPatientById(targetPid);
}

function mapPatient(row) {
  if (!row) return null;
  return {
    Patient_ID: row.Patient_ID,
    Full_Name: row.Full_Name,
    Gender: row.Gender,
    Birth_Date: row.Birth_Date,
    Phone: row.Phone,
    National_ID: row.National_ID,
    Allergy_Name: row.Allergy_Name || null,
    Created_At: row.Created_At,
  };
}

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  findDuplicates,
  mergePatients,
};
