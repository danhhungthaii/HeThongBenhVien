const { addAuditLog } = require('../../common/helpers/audit-log');
const { AppError } = require('../../common/errors/AppError');
const { patientRepository } = require('./patient.repository');

function formatDate(value) {
  return value.toISOString().slice(0, 10).replace(/-/g, '');
}

function generatePatientPid() {
  const datePart = formatDate(new Date());
  const nextSequence = (generatePatientPid.sequenceByDate.get(datePart) ?? 0) + 1;
  generatePatientPid.sequenceByDate.set(datePart, nextSequence);
  return `BV-${datePart}-${String(nextSequence).padStart(4, '0')}`;
}

generatePatientPid.sequenceByDate = new Map();

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

class PatientService {
  async list() {
    return (await patientRepository.findAll()).filter((patient) => !patient.deletedAt);
  }

  async getById(id) {
    const patient = await patientRepository.findById(id);

    if (!patient || patient.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  async create(data) {
    return patientRepository.create({
      ...data,
      pid: generatePatientPid(),
    });
  }

  async update(id, data) {
    const current = await patientRepository.findById(id);

    if (!current || current.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    const oldValue = cloneValue(current);
    const updated = await patientRepository.update(id, data);

    if (!updated) {
      throw new AppError('Patient not found', 404);
    }

    addAuditLog({
      action: 'UPDATE',
      userId: 'mock-user',
      oldValue,
      newValue: cloneValue(updated),
    });

    return updated;
  }

  async delete(id) {
    const current = await patientRepository.findById(id);

    if (!current || current.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    const oldValue = cloneValue(current);
    const deleted = await patientRepository.update(id, {
      status: 'inactive',
      deletedAt: new Date().toISOString(),
    });

    if (!deleted) {
      throw new AppError('Patient not found', 404);
    }

    addAuditLog({
      action: 'DELETE',
      userId: 'mock-user',
      oldValue,
      newValue: cloneValue(deleted),
    });
  }
}

const patientService = new PatientService();

module.exports = { PatientService, patientService };