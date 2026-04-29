import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { PrescriptionDto } from './prescription.dto';

export const prescriptionRepository = new InMemoryRepository<PrescriptionDto>();
