const { InMemoryRepository } = require('../../common/repositories/in-memory.repository');

const queueRepository = new InMemoryRepository();

module.exports = { queueRepository };