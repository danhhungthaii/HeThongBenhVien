import { AppError } from '../../common/errors/AppError';
import type { CreateEncounterDto, EncounterDto } from './encounter.dto';
import { encounterRepository } from './encounter.repository';

export class EncounterService {
  async list(): Promise<EncounterDto[]> {
    return encounterRepository.findAll();
  }

  async getById(id: string): Promise<EncounterDto> {
    const encounter = await encounterRepository.findById(id);

    if (!encounter) {
      throw new AppError('Encounter not found', 404);
    }

    return encounter;
  }

  async create(data: CreateEncounterDto): Promise<EncounterDto> {
    return encounterRepository.create(data);
  }
}

export const encounterService = new EncounterService();
