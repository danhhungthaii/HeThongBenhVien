const { appointmentService } = require('./appointment.service');

class AppointmentController {
  async list(_req, res) {
    const appointments = await appointmentService.list();
    res.json({ success: true, message: 'Appointments fetched successfully', data: appointments });
  }

  async getById(req, res) {
    const appointment = await appointmentService.getById(req.params.id);
    res.json({ success: true, message: 'Appointment fetched successfully', data: appointment });
  }

  async create(req, res) {
    const appointment = await appointmentService.create(req.body);
    res.status(201).json({ success: true, message: 'Appointment created successfully', data: appointment });
  }

  async update(req, res) {
    const appointment = await appointmentService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Appointment updated successfully', data: appointment });
  }

  async delete(req, res) {
    await appointmentService.delete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  }
}

const appointmentController = new AppointmentController();

module.exports = { AppointmentController, appointmentController };