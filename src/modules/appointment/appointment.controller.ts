import type { Request, Response } from 'express';

import { appointmentService } from './appointment.service';

export class AppointmentController {
  async list(_req: Request, res: Response): Promise<void> {
    const appointments = await appointmentService.list();
    res.json({ success: true, message: 'Appointments fetched successfully', data: appointments });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const appointment = await appointmentService.getById(req.params.id);
    res.json({ success: true, message: 'Appointment fetched successfully', data: appointment });
  }

  async create(req: Request, res: Response): Promise<void> {
    const appointment = await appointmentService.create(req.body);
    res.status(201).json({ success: true, message: 'Appointment created successfully', data: appointment });
  }

  async update(req: Request, res: Response): Promise<void> {
    const appointment = await appointmentService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Appointment updated successfully', data: appointment });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await appointmentService.delete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  }
}

export const appointmentController = new AppointmentController();
