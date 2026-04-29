import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { EncounterDto } from './encounter.dto';

export const encounterRepository = new InMemoryRepository<EncounterDto>();
