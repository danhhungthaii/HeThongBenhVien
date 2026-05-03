const { randomUUID } = require('node:crypto');
const { PatientRepository } = require('../patient.repository.base');

/**
 * SqlPatientRepository - SQL Server implementation
 * Connects to SQL Server database for persistent patient storage.
 * 
 * TODO: Implement after database is setup
 * - Connection pool
 * - Patient table mapping
 * - Field conversions (id ↔ Patient_ID, name ↔ Full_Name)
 * - Soft-delete queries (check Status != 'inactive')
 */
class SqlPatientRepository extends PatientRepository {
  constructor(connectionPool) {
    super();
    this.connectionPool = connectionPool;
    this.tableName = 'Patients';
  }

  async findAll() {
    // TODO: SELECT * FROM Patients WHERE Status != 'inactive'
    throw new Error('SqlPatientRepository.findAll() - Not implemented yet');
  }

  async findById(id) {
    // TODO: SELECT * FROM Patients WHERE Patient_ID = @id
    throw new Error('SqlPatientRepository.findById() - Not implemented yet');
  }

  async create(data) {
    // TODO: INSERT INTO Patients (Patient_ID, Full_Name, Phone, DateOfBirth, Gender, Address, Status, CreatedAt)
    // Map: id → Patient_ID, name → Full_Name, etc.
    // Return created patient with id, pid, createdAt
    throw new Error('SqlPatientRepository.create() - Not implemented yet');
  }

  async update(id, patch) {
    // TODO: UPDATE Patients SET ... WHERE Patient_ID = @id
    // Map patch fields: name → Full_Name, etc.
    // Return updated patient or null if not found
    throw new Error('SqlPatientRepository.update() - Not implemented yet');
  }

  async delete(id) {
    // TODO: UPDATE Patients SET Status = 'inactive', DeletedAt = GETDATE() WHERE Patient_ID = @id
    // Return updated patient or null if not found
    throw new Error('SqlPatientRepository.delete() - Not implemented yet');
  }
}

module.exports = { SqlPatientRepository };
