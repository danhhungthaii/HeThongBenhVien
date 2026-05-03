'use strict';
const db = require('../../config/database');
const { ValidationError, ConflictError } = require('../../common/errors/AppError');

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

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function parseAllergyList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;]+/)
    .map(item => normalizeText(item))
    .filter(Boolean);
}

function resolveMainDiagnosis(encounter) {
  if (encounter.main_icd10) return encounter.main_icd10;
  const diagnoses = encounter.diagnoses || [];
  const primary = diagnoses.find(d => d.type === 'primary' && d.icd10_code);
  return primary ? primary.icd10_code : null;
}

function isBHYTPatient(patient) {
  return Boolean(patient?.insurance_id) || (patient?.bhyt_coverage_rate || 0) > 0;
}

function ensureMainDiagnosis(encounter) {
  const mainIcd10 = resolveMainDiagnosis(encounter);
  if (!mainIcd10) {
    throw new ValidationError('Main ICD-10 diagnosis is required before closing or prescribing');
  }
}

function ensureItemsArray(items, message) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError(message);
  }
}

async function createEncounter(data) {
  const encounter = {
    encounter_id: ++db.counters.encounter,
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    department_id: data.department_id,
    room_id: data.room_id || null,
    appointment_id: data.appointment_id || null,
    queue_number: data.queue_number || null,
    patient_type: data.patient_type || null,
    visit_date: data.visit_date || new Date().toISOString().split('T')[0],
    visit_type: data.visit_type || 'outpatient',
    status: data.status || 'waiting',
    chief_complaint: data.chief_complaint || null,
    symptoms: data.symptoms || null,
    history_of_present_illness: data.history_of_present_illness || null,
    physical_exam: data.physical_exam || null,
    diagnosis_codes: data.diagnosis_codes || null,
    diagnosis_notes: data.diagnosis_notes || null,
    main_icd10: data.main_icd10 || null,
    diagnoses: Array.isArray(data.diagnoses) ? data.diagnoses : [],
    progress_notes: [],
    clinical_order_ids: [],
    clinical_results: [],
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

  if (changes.status === 'completed') {
    ensureMainDiagnosis(existing);
  }

  const updated = db.update('encounters', e => e.encounter_id === parseInt(id), {
    ...changes,
    updated_at: new Date(),
  });
  return updated[0] || null;
}

async function addVitals(encounterId, vitalsData) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  let bmi = vitalsData?.bmi;
  if (!bmi && vitalsData?.weight && vitalsData?.height) {
    const heightMeters = Number(vitalsData.height) / 100;
    if (heightMeters > 0) {
      bmi = Number(vitalsData.weight) / (heightMeters ** 2);
      bmi = Number.isFinite(bmi) ? Number(bmi.toFixed(2)) : undefined;
    }
  }

  const vitals = {
    recorded_at: new Date().toISOString(),
    ...vitalsData,
    bmi,
  };

  const existingVitals = existing.vitals || [];
  existingVitals.push(vitals);

  const updates = { vitals: existingVitals };
  if (existing.status === 'waiting') {
    updates.status = 'in_progress';
  }
  return updateEncounter(encounterId, updates);
}

async function addDiagnosis(encounterId, diagnosis) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  if (!diagnosis || !diagnosis.icd10_code) {
    throw new ValidationError('icd10_code is required');
  }

  const type = diagnosis.type || 'primary';
  const allowedTypes = ['primary', 'secondary', 'differential'];
  if (!allowedTypes.includes(type)) {
    throw new ValidationError(`type must be one of: ${allowedTypes.join(', ')}`);
  }

  const diagnoses = existing.diagnoses || [];
  diagnoses.push({
    ...diagnosis,
    type,
    diagnosed_at: new Date().toISOString(),
  });

  const mainDiagnosis = diagnoses.find(d => d.type === 'primary' && d.icd10_code) || null;
  const mainIcd10 = mainDiagnosis ? mainDiagnosis.icd10_code : existing.main_icd10;
  const diagnosisSummary = mainDiagnosis?.description || mainDiagnosis?.name || null;

  const updates = {
    diagnosis_codes: diagnoses.map(d => d.icd10_code).filter(Boolean).join(', '),
    diagnosis_notes: diagnoses.map(d => d.description).filter(Boolean).join('; '),
    diagnoses,
    main_icd10: mainIcd10,
    diagnosis: diagnosisSummary,
  };

  if (existing.status === 'waiting') {
    updates.status = 'in_progress';
  }

  return updateEncounter(encounterId, updates);
}

async function closeEncounter(encounterId) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  ensureMainDiagnosis(existing);
  return updateEncounter(encounterId, { status: 'completed' });
}

async function addClinicalNote(encounterId, payload) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  if (!payload || !payload.note) {
    throw new ValidationError('note is required');
  }

  const note = {
    progress_note_id: ++db.counters.progressNote,
    encounter_id: existing.encounter_id,
    patient_id: existing.patient_id,
    doctor_id: existing.doctor_id,
    note: payload.note,
    note_type: payload.note_type || 'progress',
    created_by: payload.created_by || null,
    created_at: new Date(),
  };

  db.insert('progressNotes', note);

  const currentNotes = existing.progress_notes || [];
  currentNotes.push(note);

  const updates = { progress_notes: currentNotes };
  if (existing.status === 'waiting') {
    updates.status = 'in_progress';
  }

  return updateEncounter(encounterId, updates);
}

function normalizeClinicalOrderItems(payload) {
  if (Array.isArray(payload?.items)) {
    return payload.items.map(item => ({
      service_id: item.service_id,
      note: item.note || null,
    }));
  }
  if (Array.isArray(payload?.service_ids)) {
    return payload.service_ids.map(serviceId => ({ service_id: serviceId }));
  }
  return [];
}

function mapClinicalOrderToM3Payload(order) {
  return {
    encounter_id: order.encounter_id,
    patient_id: order.patient_id,
    doctor_id: order.doctor_id,
    requested_at: order.created_at,
    items: order.items.map(item => ({
      service_id: item.service_id,
      note: item.note || null,
    })),
  };
}

async function createClinicalOrder(encounterId, payload) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  const items = normalizeClinicalOrderItems(payload);
  ensureItemsArray(items, 'Clinical order items are required');

  const normalizedItems = items.map(item => {
    if (!item.service_id) {
      throw new ValidationError('service_id is required');
    }
    const service = db.findOne('services', s => s.service_id === parseInt(item.service_id));
    if (!service) {
      throw new ValidationError(`Service not found: ${item.service_id}`);
    }
    return {
      service_id: service.service_id,
      service_name: service.service_name,
      department_id: service.department_id,
      base_price: service.base_price ?? null,
      bhyt_price: service.bhyt_price ?? null,
      note: item.note || null,
    };
  });

  const order = {
    clinical_order_id: ++db.counters.clinicalOrder,
    encounter_id: existing.encounter_id,
    patient_id: existing.patient_id,
    doctor_id: existing.doctor_id,
    items: normalizedItems,
    status: 'pending',
    created_by: payload?.created_by || null,
    created_at: new Date(),
  };

  db.insert('clinicalOrders', order);

  const currentIds = existing.clinical_order_ids || [];
  currentIds.push(order.clinical_order_id);

  await updateEncounter(encounterId, {
    clinical_order_ids: currentIds,
    status: 'waiting_for_results',
  });

  return {
    order,
    m3_payload: mapClinicalOrderToM3Payload(order),
  };
}

async function receiveClinicalResults(encounterId, payload) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  ensureItemsArray(payload?.results, 'Clinical results are required');

  const results = payload.results.map(result => ({
    service_id: result.service_id || null,
    result: result.result || null,
    attachment_url: result.attachment_url || null,
    received_at: result.received_at || new Date().toISOString(),
  }));

  const currentResults = existing.clinical_results || [];
  currentResults.push(...results);

  const updates = { clinical_results: currentResults };
  if (existing.status === 'waiting_for_results') {
    updates.status = 'in_progress';
  }

  return updateEncounter(encounterId, updates);
}

async function addPrescription(encounterId, payload) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  ensureMainDiagnosis(existing);

  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ValidationError('Prescription items are required');
  }

  const patient = db.findOne('patients', p => p.patient_id === existing.patient_id);
  if (!patient) {
    throw new ValidationError('Patient is required for prescription');
  }

  const patientAllergies = parseAllergyList(patient.allergy);
  const isBHYT = isBHYTPatient(patient);

  const normalizedItems = payload.items.map(item => {
    const drug = db.findOne('drugs', d => d.drug_id === parseInt(item.drug_id));
    if (!drug) {
      throw new ValidationError(`Drug not found: ${item.drug_id}`);
    }

    const quantity = Number(item.quantity || 0);
    if (!quantity || quantity <= 0) {
      throw new ValidationError(`Invalid quantity for drug ${drug.drug_id}`);
    }

    if (drug.current_stock < quantity) {
      throw new ConflictError(`Drug ${drug.drug_name} stock is only ${drug.current_stock}`);
    }

    if (isBHYT && !drug.is_bhyt && !item.is_service_drug) {
      throw new ValidationError(`Drug ${drug.drug_name} is not covered by BHYT`);
    }

    const ingredient = normalizeText(drug.active_ingredient || drug.drug_name);
    const hasAllergy = ingredient && patientAllergies.includes(ingredient);
    if (hasAllergy && !item.confirm_allergy_override) {
      throw new ValidationError(`Allergy alert for drug ${drug.drug_name}`);
    }

    return {
      drug_id: drug.drug_id,
      drug_name: drug.drug_name,
      active_ingredient: drug.active_ingredient || null,
      quantity,
      dosage: item.dosage || null,
      frequency: item.frequency || null,
      route: item.route || null,
      is_bhyt: drug.is_bhyt,
      is_service_drug: Boolean(item.is_service_drug),
    };
  });

  const prescription = {
    prescription_id: ++db.counters.prescription,
    encounter_id: existing.encounter_id,
    patient_id: existing.patient_id,
    doctor_id: existing.doctor_id,
    items: normalizedItems,
    note: payload.note || null,
    status: 'active',
    created_by: payload.created_by || null,
    created_at: new Date(),
  };

  db.insert('prescriptions', prescription);

  const currentIds = existing.prescription_ids || [];
  currentIds.push(prescription.prescription_id);
  await updateEncounter(encounterId, { prescription_ids: currentIds });

  return prescription;
}

async function buildBillingPayload(encounterId) {
  const existing = await getEncounterById(encounterId);
  if (!existing) return null;

  const clinicalOrders = db.findMany(
    'clinicalOrders',
    order => order.encounter_id === existing.encounter_id
  );
  const prescriptions = db.findMany(
    'prescriptions',
    prescription => prescription.encounter_id === existing.encounter_id
  );

  const clinicalItems = clinicalOrders.flatMap(order => order.items || []);
  const clinicalTotals = clinicalItems.map(item => ({
    service_id: item.service_id,
    service_name: item.service_name,
    department_id: item.department_id,
    base_price: item.base_price || null,
    bhyt_price: item.bhyt_price || null,
  }));

  const prescriptionItems = prescriptions.flatMap(p => p.items || []).map(item => ({
    drug_id: item.drug_id,
    drug_name: item.drug_name,
    quantity: item.quantity,
    dosage: item.dosage || null,
    frequency: item.frequency || null,
    route: item.route || null,
    is_bhyt: item.is_bhyt,
  }));

  return {
    encounter_id: existing.encounter_id,
    patient_id: existing.patient_id,
    doctor_id: existing.doctor_id,
    visit_date: existing.visit_date,
    status: existing.status,
    clinical_orders: clinicalTotals,
    prescriptions: prescriptionItems,
  };
}

module.exports = {
  getEncounters,
  getEncounterById,
  createEncounter,
  updateEncounter,
  addVitals,
  addDiagnosis,
  closeEncounter,
  addClinicalNote,
  createClinicalOrder,
  receiveClinicalResults,
  mapClinicalOrderToM3Payload,
  addPrescription,
  buildBillingPayload,
};
