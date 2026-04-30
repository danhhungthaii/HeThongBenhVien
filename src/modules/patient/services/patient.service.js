'use strict';
const db = require('../../../config/database');

function generatePatientId() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  const todayPatients = db.findMany('patients', p => p.patient_id && p.patient_id.startsWith(`BV-${dateStr}`));
  const nextNum = String(todayPatients.length + 1).padStart(4, '0');
  return `BV-${dateStr}-${nextNum}`;
}

async function getPatients(filters = {}) {
  let items = db.findAll('patients').filter(p => p.is_active !== false);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(p =>
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.patient_id && p.patient_id.toLowerCase().includes(q)) ||
      (p.cccd && p.cccd.includes(q))
    );
  }
  if (filters.gender) {
    items = items.filter(p => p.gender === filters.gender);
  }
  if (filters.blood_type) {
    items = items.filter(p => p.blood_type === filters.blood_type);
  }

  return items;
}

async function getPatientById(pid) {
  return db.findOne('patients', p => p.patient_id === pid && p.is_active !== false);
}

async function createPatient(data) {
  const patientId = generatePatientId();
  const patient = {
    patient_id: patientId,
    full_name: data.full_name,
    dob: data.dob || null,
    gender: data.gender || null,
    cccd: data.cccd || null,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email || null,
    blood_type: data.blood_type || null,
    allergy: data.allergy || null,
    insurance_id: data.insurance_id || null,
    insurance_expire: data.insurance_expire || null,
    bhyt_coverage_rate: data.bhyt_coverage_rate || 0,
    emergency_contact: data.emergency_contact || null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return db.insert('patients', patient);
}

async function updatePatient(pid, changes) {
  const existing = await getPatientById(pid);
  if (!existing) return null;
  const updated = db.update('patients', p => p.patient_id === pid, changes);
  return updated[0] || null;
}

async function deletePatient(pid) {
  return db.update('patients', p => p.patient_id === pid, { is_active: false });
}

async function findDuplicates(data) {
  const items = db.findAll('patients').filter(p => p.is_active !== false);
  const candidates = [];

  for (const p of items) {
    let score = 0;
    if (data.phone && p.phone === data.phone) score += 3;
    if (data.cccd && p.cccd === data.cccd) score += 5;
    if (data.dob && p.dob === data.dob) score += 2;
    if (data.full_name && p.full_name.toLowerCase() === (data.full_name || '').toLowerCase()) score += 1;

    if (score >= 2) candidates.push({ patient: p, match_score: score });
  }

  return candidates.sort((a, b) => b.match_score - a.match_score);
}

async function mergePatients(targetPid, sourcePid) {
  // Mark source as merged, keep all records under target
  await db.update('patients', p => p.patient_id === sourcePid, {
    is_active: false,
    patient_id: `${sourcePid} (merged into ${targetPid})`,
  });
  return getPatientById(targetPid);
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
