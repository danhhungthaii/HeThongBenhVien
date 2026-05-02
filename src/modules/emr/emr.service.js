'use strict';
const db = require('../../config/database');

async function getPatientHistory(patientId) {
  const encounters = db.findMany('encounters', e => e.patient_id === patientId)
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const prescriptions = db.findMany('prescriptions', p => p.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const clinicalOrders = db.findMany('clinicalOrders', o => o.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const timeline = [];

  for (const enc of encounters) {
    const doctor = db.findOne('doctors', d => d.doctor_id === enc.doctor_id);
    const dept = db.findOne('departments', d => d.department_id === enc.department_id);
    const encPrescriptions = prescriptions.filter(p => p.encounter_id === enc.encounter_id);
    const encOrders = clinicalOrders.filter(o => o.encounter_id === enc.encounter_id);

    timeline.push({
      type: 'encounter',
      id: enc.encounter_id,
      date: enc.visit_date,
      doctor: doctor ? { id: doctor.doctor_id, specialty: doctor.specialty } : null,
      department: dept ? { id: dept.department_id, name: dept.department_name } : null,
      chief_complaint: enc.chief_complaint,
      diagnosis: enc.diagnosis,
      vitals: enc.vitals,
      prescriptions: encPrescriptions,
      clinical_orders: encOrders,
    });
  }

  return {
    patient_id: patientId,
    total_encounters: encounters.length,
    timeline,
  };
}

async function getPatientSummary(patientId) {
  const patient = db.findOne('patients', p => p.patient_id === patientId);
  if (!patient) return null;

  const latestEncounter = db.findMany('encounters', e => e.patient_id === patientId)
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))[0];

  const activePrescriptions = db.findMany('prescriptions', p =>
    p.patient_id === patientId &&
    p.status === 'active'
  );

  return {
    patient_id: patientId,
    full_name: patient.full_name,
    dob: patient.dob,
    blood_type: patient.blood_type,
    allergy: patient.allergy,
    insurance_id: patient.insurance_id,
    latest_visit: latestEncounter ? {
      date: latestEncounter.visit_date,
      diagnosis: latestEncounter.diagnosis,
      department: latestEncounter.department_id,
    } : null,
    active_medications: activePrescriptions.map(p => ({
      prescription_id: p.prescription_id,
      drugs: p.drugs,
    })),
    total_visits: db.count('encounters', e => e.patient_id === patientId),
  };
}

module.exports = { getPatientHistory, getPatientSummary };
