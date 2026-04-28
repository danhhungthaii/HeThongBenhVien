import type { Request, Response } from 'express';

import { patientService } from './patient.service';

export class PatientController {
  async list(_req: Request, res: Response): Promise<void> {
    const patients = await patientService.list();
    res.json({ success: true, message: 'Patients fetched successfully', data: patients });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const patient = await patientService.getById(req.params.id);
    res.json({ success: true, message: 'Patient fetched successfully', data: patient });
  }

  async create(req: Request, res: Response): Promise<void> {
    const patient = await patientService.create(req.body);
    res.status(201).json({ success: true, message: 'Patient created successfully', data: patient });
  }

  async update(req: Request, res: Response): Promise<void> {
    const patient = await patientService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Patient updated successfully', data: patient });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await patientService.delete(req.params.id);
    res.json({ success: true, message: 'Patient deleted successfully' });
  }
}

export const patientController = new PatientController();
