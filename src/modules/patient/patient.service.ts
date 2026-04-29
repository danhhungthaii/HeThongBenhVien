import { AppError } from '../../common/errors/AppError';
import type { CreatePatientDto, UpdatePatientDto, PatientDto } from './patient.dto';
import { patientRepository } from './patient.repository';

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10).replace(/-/g, '');
}

function generatePatientPid(): string {
  const datePart = formatDate(new Date());
  const nextSequence = (generatePatientPid.sequenceByDate.get(datePart) ?? 0) + 1;
  generatePatientPid.sequenceByDate.set(datePart, nextSequence);
  return `BV-${datePart}-${String(nextSequence).padStart(4, '0')}`;
}

generatePatientPid.sequenceByDate = new Map<string, number>();

export class PatientService {
  async list(): Promise<PatientDto[]> {
    return (await patientRepository.findAll()).filter((patient) => !patient.deletedAt);
  }

  async getById(id: string): Promise<PatientDto> {
    const patient = await patientRepository.findById(id);

    if (!patient || patient.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  async create(data: CreatePatientDto): Promise<PatientDto> {
    return patientRepository.create({
      ...data,
      pid: generatePatientPid(),
    });
  }

  async update(id: string, data: UpdatePatientDto): Promise<PatientDto> {
    const updated = await patientRepository.update(id, data);

    if (!updated || updated.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const patient = await patientRepository.findById(id);

    if (!patient || patient.deletedAt) {
      throw new AppError('Patient not found', 404);
    }

    const deleted = await patientRepository.update(id, {
      status: 'inactive',
      deletedAt: new Date().toISOString(),
    });

    if (!deleted) {
      throw new AppError('Patient not found', 404);
    }
  }
}

export const patientService = new PatientService();
