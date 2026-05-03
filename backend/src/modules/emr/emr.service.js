'use strict';

/**
 * emr.service.js — SQL Server implementation
 * EMR = Electronic Medical Record — aggregated view per patient
 */
const { poolPromise, sql } = require('../../database/database.real');

async function getPool() {
  return poolPromise;
}

async function getPatientHistory(patientId) {
  const pool = await getPool();

  const encounters = await pool.request()
    .input('patientId', sql.UniqueIdentifier, patientId)
    .query(`
      SELECT e.*
      FROM M2_Encounters e
      WHERE e.Patient_ID = @patientId
      ORDER BY e.Created_At DESC
    `);

  const prescriptions = await pool.request()
    .input('patientId2', sql.UniqueIdentifier, patientId)
    .query(`
      SELECT pr.*
      FROM Prescriptions pr
      INNER JOIN M2_Encounters e ON pr.Encounter_ID = e.Encounter_ID
      WHERE e.Patient_ID = @patientId2
      ORDER BY pr.Created_At DESC
    `);

  const timeline = encounters.recordset.map(enc => {
    const encPrescriptions = prescriptions.recordset.filter(
      p => p.Encounter_ID.toString() === enc.Encounter_ID.toString()
    );
    return {
      type: 'encounter',
      id: enc.Encounter_ID,
      date: enc.Created_At,
      doctor_id: enc.Doctor_ID,
      chief_complaint: enc.Chief_Complaint,
      clinical_notes: enc.Clinical_Notes,
      main_icd10: enc.Main_ICD10,
      status: enc.Encounter_Status,
      vitals: {
        pulse: enc.Pulse,
        temperature: enc.Temperature,
        weight: enc.Weight,
        height: enc.Height,
        bmi: enc.BMI,
      },
      prescriptions: encPrescriptions.map(p => ({
        prescription_id: p.Prescription_ID,
        drug_name: p.Drug_Name,
        dosage: p.Dosage,
        duration: p.Duration,
      })),
    };
  });

  return {
    patient_id: patientId,
    total_encounters: encounters.recordset.length,
    timeline,
  };
}

async function getPatientSummary(patientId) {
  const pool = await getPool();

  const patientRes = await pool.request()
    .input('patientId', sql.UniqueIdentifier, patientId)
    .query(`
      SELECT p.*, pa.Allergy_Name
      FROM Patients p
      LEFT JOIN Patient_Allergies pa ON p.Patient_ID = pa.Patient_ID
      WHERE p.Patient_ID = @patientId
    `);
  if (!patientRes.recordset[0]) return null;
  const patient = patientRes.recordset[0];

  const latestEncRes = await pool.request()
    .input('patientId2', sql.UniqueIdentifier, patientId)
    .query(`SELECT TOP 1 * FROM M2_Encounters WHERE Patient_ID = @patientId2 ORDER BY Created_At DESC`);
  const latestEnc = latestEncRes.recordset[0];

  const countRes = await pool.request()
    .input('patientId3', sql.UniqueIdentifier, patientId)
    .query(`SELECT COUNT(*) AS cnt FROM M2_Encounters WHERE Patient_ID = @patientId3`);

  return {
    patient_id: patient.Patient_ID,
    full_name: patient.Full_Name,
    gender: patient.Gender,
    dob: patient.Birth_Date,
    allergy: patient.Allergy_Name || null,
    latest_visit: latestEnc ? {
      date: latestEnc.Created_At,
      main_icd10: latestEnc.Main_ICD10,
      status: latestEnc.Encounter_Status,
    } : null,
    total_visits: countRes.recordset[0].cnt,
  };
}

module.exports = { getPatientHistory, getPatientSummary };
