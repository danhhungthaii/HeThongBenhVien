const { InMemoryRepository } = require('../../common/repositories/in-memory.repository');

const patientRepository = new InMemoryRepository();

module.exports = { patientRepository };