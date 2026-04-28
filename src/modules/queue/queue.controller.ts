import type { Request, Response } from 'express';

import { queueService } from './queue.service';

export class QueueController {
  async list(_req: Request, res: Response): Promise<void> {
    const queues = await queueService.list();
    res.json({ success: true, message: 'Queues fetched successfully', data: queues });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const queue = await queueService.getById(req.params.id);
    res.json({ success: true, message: 'Queue fetched successfully', data: queue });
  }

  async create(req: Request, res: Response): Promise<void> {
    const queue = await queueService.create(req.body);
    res.status(201).json({ success: true, message: 'Queue created successfully', data: queue });
  }

  async callNext(_req: Request, res: Response): Promise<void> {
    const queue = await queueService.callNext();
    res.json({ success: true, message: 'Next patient called successfully', data: queue });
  }

  async complete(req: Request, res: Response): Promise<void> {
    const queue = await queueService.complete(req.params.id);
    res.json({ success: true, message: 'Queue marked as done successfully', data: queue });
  }
}

export const queueController = new QueueController();
