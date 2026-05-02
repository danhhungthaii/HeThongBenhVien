const { InMemoryRepository } = require('../../database/models/in-memory.repository');

const queueRepository = new InMemoryRepository();

module.exports = { queueRepository };