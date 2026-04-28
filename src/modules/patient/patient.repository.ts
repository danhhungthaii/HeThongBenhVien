import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { PatientDto } from './patient.dto';

export const patientRepository = new InMemoryRepository<PatientDto>();
