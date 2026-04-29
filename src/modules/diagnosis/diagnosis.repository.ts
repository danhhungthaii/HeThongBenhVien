import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { DiagnosisDto } from './diagnosis.dto';

export const diagnosisRepository = new InMemoryRepository<DiagnosisDto>();
