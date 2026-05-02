const { randomUUID } = require('node:crypto');

class InMemoryRepository {
  constructor(seed = []) {
    this.items = new Map();

    seed.forEach((item) => {
      this.items.set(item.id, item);
    });
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
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id) {
    return this.items.delete(id);
  }
}

module.exports = { InMemoryRepository };