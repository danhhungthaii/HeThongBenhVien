const { AppError } = require('../../common/errors/AppError');
const { appointmentRepository } = require('./appointment.repository');

async function hasSlotConflict(target, currentId) {
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

class AppointmentService {
  async list() {
    return appointmentRepository.findAll();
  }

  async getById(id) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    return appointment;
  }

  async create(data) {
    if (await hasSlotConflict(data)) {
      throw new AppError('Appointment slot is not available', 409);
    }

    return appointmentRepository.create(data);
  }

  async update(id, data) {
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

  async delete(id) {
    const deleted = await appointmentRepository.delete(id);

    if (!deleted) {
      throw new AppError('Appointment not found', 404);
    }
  }
}

const appointmentService = new AppointmentService();

module.exports = { AppointmentService, appointmentService };