import { AppError } from '../../common/errors/AppError';
import type { AppointmentDto, CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto';
import { appointmentRepository } from './appointment.repository';

export class AppointmentService {
  async list(): Promise<AppointmentDto[]> {
    return appointmentRepository.findAll();
  }

  async getById(id: string): Promise<AppointmentDto> {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    return appointment;
  }

  async create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    return appointmentRepository.create(data);
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto> {
    const updated = await appointmentRepository.update(id, data);

    if (!updated) {
      throw new AppError('Appointment not found', 404);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await appointmentRepository.delete(id);

    if (!deleted) {
      throw new AppError('Appointment not found', 404);
    }
  }
}

export const appointmentService = new AppointmentService();
