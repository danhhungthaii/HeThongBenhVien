import type { CreateDiagnosisDto, DiagnosisDto } from './diagnosis.dto';
import { diagnosisRepository } from './diagnosis.repository';

export class DiagnosisService {
  async list(): Promise<DiagnosisDto[]> {
    return diagnosisRepository.findAll();
  }

  async create(data: CreateDiagnosisDto): Promise<DiagnosisDto> {
    return diagnosisRepository.create(data);
  }
}

export const diagnosisService = new DiagnosisService();
