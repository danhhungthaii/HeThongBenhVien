const { InMemoryRepository } = require('../../common/repositories/in-memory.repository');

const appointmentRepository = new InMemoryRepository();

module.exports = { appointmentRepository };