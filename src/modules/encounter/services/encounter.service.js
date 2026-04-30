'use strict';
const db = require('../../../config/database');

async function getEncounters(filters = {}) {
  let items = db.findAll('encounters');

  if (filters.patient_id) items = items.filter(e => e.patient_id === filters.patient_id);
  if (filters.doctor_id) items = items.filter(e => e.doctor_id === parseInt(filters.doctor_id));
  if (filters.department_id) items = items.filter(e => e.department_id === parseInt(filters.department_id));
  if (filters.status) items = items.filter(e => e.status === filters.status);
  if (filters.from_date) items = items.filter(e => e.visit_date >= filters.from_date);
  if (filters.to_date) items = items.filter(e => e.visit_date <= filters.to_date);

  return items.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
}

async function getEncounterById(id) {
  return db.findOne('encounters', e => e.encounter_id === parseInt(id));
}

async function createEncounter(data) {
  const encounter = {
    encounter_id: ++db.counters.encounter,
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    department_id: data.department_id,
    appointment_id: data.appointment_id || null,
    visit_date: data.visit_date || new Date().toISOString().split('T')[0],
    visit_type: data.visit_type || 'outpatient',
    status: 'in_progress',
    chief_complaint: data.chief_complaint || null,
    history_of_present_illness: data.history_of_present_illness || null,
    physical_exam: data.physical_exam || null,
    diagnosis_codes: data.diagnosis_codes || null,
    diagnosis_notes: data.diagnosis_notes || null,
    plan: data.plan || null,
    notes: data.notes || null,
    created_by: data.created_by || null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return db.insert('encounters', encounter);
}

async function updateEncounter(id, changes) {
  const existing = await getEncounterById(id);
  if (!existing) return null;

  const updated = db.update('encounters', e => e.encounter_id === parseInt(id), {
    ...changes,
    updated_at: new Date(),
  });
  return updated[0] || null;
}

async function addVitals(encounterId, vitalsData) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  const vitals = {
    recorded_at: new Date().toISOString(),
    ...vitalsData,
  };

  const existingVitals = existing.vitals || [];
  existingVitals.push(vitals);

  return updateEncounter(encounterId, { vitals: existingVitals });
}

async function addDiagnosis(encounterId, diagnosis) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  const diagnoses = existing.diagnoses || [];
  diagnoses.push({
    ...diagnosis,
    diagnosed_at: new Date().toISOString(),
  });

  return updateEncounter(encounterId, {
    diagnosis_codes: diagnoses.map(d => d.icd10_code).filter(Boolean).join(', '),
    diagnosis_notes: diagnoses.map(d => d.description).filter(Boolean).join('; '),
    diagnoses,
  });
}

async function closeEncounter(encounterId) {
  return updateEncounter(encounterId, { status: 'completed' });
}

module.exports = {
  getEncounters,
  getEncounterById,
  createEncounter,
  updateEncounter,
  addVitals,
  addDiagnosis,
  closeEncounter,
};
