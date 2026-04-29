import type { CreatePrescriptionDto, PrescriptionDto } from './prescription.dto';
import { prescriptionRepository } from './prescription.repository';

export class PrescriptionService {
  async list(): Promise<PrescriptionDto[]> {
    return prescriptionRepository.findAll();
  }

  async create(data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    return prescriptionRepository.create(data);
  }
}

export const prescriptionService = new PrescriptionService();
