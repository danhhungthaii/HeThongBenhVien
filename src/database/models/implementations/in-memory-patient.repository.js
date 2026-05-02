const { randomUUID } = require('node:crypto');
const { PatientRepository } = require('../patient.repository.base');

/**
 * InMemoryPatientRepository - In-memory implementation
 * Stores patients in a Map. Suitable for development and testing.
 */
class InMemoryPatientRepository extends PatientRepository {
  constructor() {
    super();
    this.items = new Map();
  }

  async findAll() {
    return Array.from(this.items.values());
  }

  async findById(id) {
    return this.items.get(id) ?? null;
  }

  async create(data) {
    const id = data.id ?? randomUUID();
    const entity = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    this.items.set(id, entity);
    return entity;
  }

  async update(id, patch) {
    const existing = this.items.get(id);

    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id) {
    const existing = this.items.get(id);

    if (!existing) {
      return null;
    }

    const deleted = {
      ...existing,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, deleted);
    return deleted;
  }
}

module.exports = { InMemoryPatientRepository };