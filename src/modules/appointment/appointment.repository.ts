import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { AppointmentDto } from './appointment.dto';

export const appointmentRepository = new InMemoryRepository<AppointmentDto>();
