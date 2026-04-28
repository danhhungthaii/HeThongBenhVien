import { InMemoryRepository } from '../../common/repositories/in-memory.repository';
import type { QueueDto } from './queue.dto';

export const queueRepository = new InMemoryRepository<QueueDto>();
