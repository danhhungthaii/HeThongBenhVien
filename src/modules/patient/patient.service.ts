import { AppError } from '../../common/errors/AppError';
import type { CreatePatientDto, UpdatePatientDto, PatientDto } from './patient.dto';
import { patientRepository } from './patient.repository';

export class PatientService {
  async list(): Promise<PatientDto[]> {
    return patientRepository.findAll();
  }

  async getById(id: string): Promise<PatientDto> {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  async create(data: CreatePatientDto): Promise<PatientDto> {
    return patientRepository.create(data);
  }

  async update(id: string, data: UpdatePatientDto): Promise<PatientDto> {
    const updated = await patientRepository.update(id, data);

    if (!updated) {
      throw new AppError('Patient not found', 404);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await patientRepository.delete(id);

    if (!deleted) {
      throw new AppError('Patient not found', 404);
    }
  }
}

export const patientService = new PatientService();
