const { InMemoryRepository } = require('../../database/models/in-memory.repository');

const appointmentRepository = new InMemoryRepository();

module.exports = { appointmentRepository };