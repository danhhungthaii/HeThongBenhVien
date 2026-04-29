import { AppError } from '../../common/errors/AppError';
import type { AppointmentDto, CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto';
import { appointmentRepository } from './appointment.repository';

async function hasSlotConflict(target: Pick<CreateAppointmentDto | UpdateAppointmentDto, 'appointmentDate' | 'appointmentTime'>, currentId?: string): Promise<boolean> {
  if (!target.appointmentTime) {
    return false;
  }

  const items = await appointmentRepository.findAll();

  return items.some((item) => {
    if (currentId && item.id === currentId) {
      return false;
    }

    if (item.status === 'cancelled') {
      return false;
    }

    return item.appointmentDate === target.appointmentDate && item.appointmentTime === target.appointmentTime;
  });
}

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
    if (await hasSlotConflict(data)) {
      throw new AppError('Appointment slot is not available', 409);
    }

    return appointmentRepository.create(data);
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto> {
    const current = await appointmentRepository.findById(id);

    if (!current) {
      throw new AppError('Appointment not found', 404);
    }

    const nextData = { ...current, ...data };

    if (await hasSlotConflict(nextData, id)) {
      throw new AppError('Appointment slot is not available', 409);
    }

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
