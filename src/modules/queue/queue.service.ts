import { AppError } from '../../common/errors/AppError';
import type { CreateQueueDto, QueueDto } from './queue.dto';
import { queueRepository } from './queue.repository';

export class QueueService {
  async list(): Promise<QueueDto[]> {
    return queueRepository.findAll();
  }

  async getById(id: string): Promise<QueueDto> {
    const queue = await queueRepository.findById(id);

    if (!queue) {
      throw new AppError('Queue not found', 404);
    }

    return queue;
  }

  async create(data: CreateQueueDto): Promise<QueueDto> {
    const items = await queueRepository.findAll();
    const nextQueueNumber = items.reduce((max, item) => Math.max(max, item.queueNumber), 0) + 1;

    return queueRepository.create({
      patientId: data.patientId,
      queueNumber: nextQueueNumber,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });
  }

  async callNext(): Promise<QueueDto> {
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

  async complete(id: string): Promise<QueueDto> {
    const queue = await queueRepository.findById(id);

    if (!queue) {
      throw new AppError('Queue not found', 404);
    }

    const updated = await queueRepository.update(id, { status: 'done' });

    if (!updated) {
      throw new AppError('Queue not found', 404);
    }

    return updated;
  }
}

export const queueService = new QueueService();
