import type { Request, Response } from 'express';

import { diagnosisService } from './diagnosis.service';

export class DiagnosisController {
  async list(_req: Request, res: Response): Promise<void> {
    const diagnoses = await diagnosisService.list();
    res.json({ success: true, message: 'Diagnoses fetched successfully', data: diagnoses });
  }

  async create(req: Request, res: Response): Promise<void> {
    const diagnosis = await diagnosisService.create(req.body);
    res.status(201).json({ success: true, message: 'Diagnosis created successfully', data: diagnosis });
  }
}

export const diagnosisController = new DiagnosisController();
