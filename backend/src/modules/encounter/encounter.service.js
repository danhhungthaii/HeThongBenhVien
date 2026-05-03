'use strict';

/**
 * encounter.service.js — SQL Server implementation
 * Table: M2_Encounters (Encounter_ID, Patient_ID, Doctor_ID, Pulse, Temperature, Weight, Height, BMI, Main_ICD10, Encounter_Status, Chief_Complaint, Clinical_Notes, Created_At)
 */
const { poolPromise, sql } = require('../../database/database.real');

async function getPool() {
  return poolPromise;
}

async function getEncounters(filters = {}) {
  const pool = await getPool();
  const req = pool.request();
  let where = '1=1';

  if (filters.patient_id) {
    req.input('patientId', sql.UniqueIdentifier, filters.patient_id);
    where += ' AND e.Patient_ID = @patientId';
  }
  if (filters.doctor_id) {
    req.input('doctorId', sql.Int, parseInt(filters.doctor_id));
    where += ' AND e.Doctor_ID = @doctorId';
  }
  if (filters.status) {
    req.input('status', sql.VarChar(20), filters.status);
    where += ' AND e.Encounter_Status = @status';
  }

  const result = await req.query(`
    SELECT e.*, p.Full_Name AS patient_name
    FROM M2_Encounters e
    LEFT JOIN Patients p ON e.Patient_ID = p.Patient_ID
    WHERE ${where}
    ORDER BY e.Created_At DESC
  `);
  return result.recordset.map(mapEncounter);
}

async function getEncounterById(encounterId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('encounterId', sql.UniqueIdentifier, encounterId)
    .query(`
      SELECT e.*, p.Full_Name AS patient_name
      FROM M2_Encounters e
      LEFT JOIN Patients p ON e.Patient_ID = p.Patient_ID
      WHERE e.Encounter_ID = @encounterId
    `);
  if (!result.recordset[0]) return null;
  return mapEncounter(result.recordset[0]);
}

async function createEncounter(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('patientId', sql.UniqueIdentifier, data.patient_id)
    .input('doctorId', sql.Int, data.doctor_id)
    .input('chiefComplaint', sql.NVarChar(sql.MAX), data.chief_complaint || null)
    .input('clinicalNotes', sql.NVarChar(sql.MAX), data.clinical_notes || null)
    .input('pulse', sql.Int, data.pulse || null)
    .input('temperature', sql.Decimal(5, 2), data.temperature || null)
    .input('weight', sql.Decimal(5, 2), data.weight || null)
    .input('height', sql.Decimal(5, 2), data.height || null)
    .input('bmi', sql.Decimal(5, 2), data.bmi || null)
    .input('mainIcd10', sql.VarChar(10), data.main_icd10 || null)
    .input('status', sql.VarChar(20), 'open')
    .query(`
      INSERT INTO M2_Encounters (Encounter_ID, Patient_ID, Doctor_ID, Chief_Complaint, Clinical_Notes, Pulse, Temperature, Weight, Height, BMI, Main_ICD10, Encounter_Status, Created_At)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @patientId, @doctorId, @chiefComplaint, @clinicalNotes, @pulse, @temperature, @weight, @height, @bmi, @mainIcd10, @status, GETDATE())
    `);
  return mapEncounter(result.recordset[0]);
}

async function updateEncounter(encounterId, changes) {
  const pool = await getPool();
  const req = pool.request().input('encounterId', sql.UniqueIdentifier, encounterId);
  const sets = [];

  if (changes.chief_complaint !== undefined) { req.input('chiefComplaint', sql.NVarChar(sql.MAX), changes.chief_complaint); sets.push('Chief_Complaint = @chiefComplaint'); }
  if (changes.clinical_notes !== undefined) { req.input('clinicalNotes', sql.NVarChar(sql.MAX), changes.clinical_notes); sets.push('Clinical_Notes = @clinicalNotes'); }
  if (changes.pulse !== undefined) { req.input('pulse', sql.Int, changes.pulse); sets.push('Pulse = @pulse'); }
  if (changes.temperature !== undefined) { req.input('temperature', sql.Decimal(5, 2), changes.temperature); sets.push('Temperature = @temperature'); }
  if (changes.weight !== undefined) { req.input('weight', sql.Decimal(5, 2), changes.weight); sets.push('Weight = @weight'); }
  if (changes.height !== undefined) { req.input('height', sql.Decimal(5, 2), changes.height); sets.push('Height = @height'); }
  if (changes.bmi !== undefined) { req.input('bmi', sql.Decimal(5, 2), changes.bmi); sets.push('BMI = @bmi'); }
  if (changes.main_icd10 !== undefined) { req.input('mainIcd10', sql.VarChar(10), changes.main_icd10); sets.push('Main_ICD10 = @mainIcd10'); }
  if (changes.status !== undefined) { req.input('status', sql.VarChar(20), changes.status); sets.push('Encounter_Status = @status'); }

  if (sets.length === 0) return getEncounterById(encounterId);

  await req.query(`UPDATE M2_Encounters SET ${sets.join(', ')} WHERE Encounter_ID = @encounterId`);
  return getEncounterById(encounterId);
}

function mapEncounter(row) {
  if (!row) return null;
  return {
    encounter_id: row.Encounter_ID,
    patient_id: row.Patient_ID,
    patient_name: row.patient_name || null,
    doctor_id: row.Doctor_ID,
    chief_complaint: row.Chief_Complaint,
    clinical_notes: row.Clinical_Notes,
    pulse: row.Pulse,
    temperature: row.Temperature,
    weight: row.Weight,
    height: row.Height,
    bmi: row.BMI,
    main_icd10: row.Main_ICD10,
    status: row.Encounter_Status,
    created_at: row.Created_At,
  };
}

module.exports = {
  getEncounters,
  getEncounterById,
  createEncounter,
  updateEncounter,
};
