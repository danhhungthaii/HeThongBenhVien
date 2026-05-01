const { patientService } = require('./patient.service');

class PatientController {
  async list(_req, res) {
    const patients = await patientService.list();
    res.json({ success: true, message: 'Patients fetched successfully', data: patients });
  }

  async getById(req, res) {
    const patient = await patientService.getById(req.params.id);
    res.json({ success: true, message: 'Patient fetched successfully', data: patient });
  }

  async create(req, res) {
    const patient = await patientService.create(req.body);
    res.status(201).json({ success: true, message: 'Patient created successfully', data: patient });
  }

  async update(req, res) {
    const patient = await patientService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Patient updated successfully', data: patient });
  }

  async delete(req, res) {
    await patientService.delete(req.params.id);
    res.json({ success: true, message: 'Patient deleted successfully' });
  }
}

const patientController = new PatientController();

module.exports = { PatientController, patientController };