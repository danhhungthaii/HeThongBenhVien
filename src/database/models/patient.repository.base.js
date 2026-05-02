/**
 * PatientRepository - Abstract base class for Patient data access
 * Defines CRUD contract that all implementations must follow
 */
class PatientRepository {
  /**
   * Get all patients (active only)
   * @returns {Promise<Array>}
   */
  async findAll() {
    throw new Error('findAll() not implemented');
  }

  /**
   * Get patient by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('findById() not implemented');
  }

  /**
   * Create new patient
   * @param {Object} data - Patient data (name, phone, dateOfBirth, gender, address, etc.)
   * @returns {Promise<Object>} - Created patient with generated id and pid
   */
  async create(data) {
    throw new Error('create() not implemented');
  }

  /**
   * Update existing patient
   * @param {string} id
   * @param {Object} patch - Partial patient data to update
   * @returns {Promise<Object|null>} - Updated patient or null if not found
   */
  async update(id, patch) {
    throw new Error('update() not implemented');
  }

  /**
   * Soft delete patient (set status and deletedAt)
   * @param {string} id
   * @returns {Promise<Object|null>} - Deleted patient or null if not found
   */
  async delete(id) {
    throw new Error('delete() not implemented');
  }
}

module.exports = { PatientRepository };