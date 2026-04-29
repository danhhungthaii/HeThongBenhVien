import type { Request, Response } from 'express';

import { encounterService } from './encounter.service';

export class EncounterController {
  async list(_req: Request, res: Response): Promise<void> {
    const encounters = await encounterService.list();
    res.json({ success: true, message: 'Encounters fetched successfully', data: encounters });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const encounter = await encounterService.getById(req.params.id);
    res.json({ success: true, message: 'Encounter fetched successfully', data: encounter });
  }

  async create(req: Request, res: Response): Promise<void> {
    const encounter = await encounterService.create(req.body);
    res.status(201).json({ success: true, message: 'Encounter created successfully', data: encounter });
  }
}

export const encounterController = new EncounterController();
