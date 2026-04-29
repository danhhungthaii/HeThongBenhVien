import type { Request, Response } from 'express';

import { prescriptionService } from './prescription.service';

export class PrescriptionController {
  async list(_req: Request, res: Response): Promise<void> {
    const prescriptions = await prescriptionService.list();
    res.json({ success: true, message: 'Prescriptions fetched successfully', data: prescriptions });
  }

  async create(req: Request, res: Response): Promise<void> {
    const prescription = await prescriptionService.create(req.body);
    res.status(201).json({ success: true, message: 'Prescription created successfully', data: prescription });
  }
}

export const prescriptionController = new PrescriptionController();
