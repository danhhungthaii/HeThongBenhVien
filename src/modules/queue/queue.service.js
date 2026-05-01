const { AppError } = require('../../common/errors/AppError');
const { queueRepository } = require('./queue.repository');

class QueueService {
  async list() {
    return queueRepository.findAll();
  }

  async getById(id) {
    const queue = await queueRepository.findById(id);

    if (!queue) {
      throw new AppError('Queue not found', 404);
    }

    return queue;
  }

  async create(data) {
    const items = await queueRepository.findAll();
    const nextQueueNumber = items.reduce((max, item) => Math.max(max, item.queueNumber), 0) + 1;

    return queueRepository.create({
      patientId: data.patientId,
      queueNumber: nextQueueNumber,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });
  }

  async callNext() {
    const items = await queueRepository.findAll();
    const nextQueue = items
      .filter((item) => item.status === 'waiting')
      .sort((first, second) => first.queueNumber - second.queueNumber)[0];

    if (!nextQueue) {
      throw new AppError('No waiting patient in queue', 404);
    }

    const updated = await queueRepository.update(nextQueue.id, { status: 'serving' });

    if (!updated) {
      throw new AppError('Queue not found', 404);
    }

    return updated;
  }

  async complete(id) {
    const queue = await queueRepository.findById(id);

    if (!queue) {
      throw new AppError('Queue not found', 404);
    }

    if (queue.status !== 'serving') {
      throw new AppError('Queue must be serving before completing', 409);
    }

    const updated = await queueRepository.update(id, { status: 'done' });

    if (!updated) {
      throw new AppError('Queue not found', 404);
    }

    return updated;
  }
}

const queueService = new QueueService();

module.exports = { QueueService, queueService };