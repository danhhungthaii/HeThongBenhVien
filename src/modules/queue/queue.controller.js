const { queueService } = require('./queue.service');

class QueueController {
  async list(_req, res) {
    const queues = await queueService.list();
    res.json({ success: true, message: 'Queues fetched successfully', data: queues });
  }

  async getById(req, res) {
    const queue = await queueService.getById(req.params.id);
    res.json({ success: true, message: 'Queue fetched successfully', data: queue });
  }

  async create(req, res) {
    const queue = await queueService.create(req.body);
    res.status(201).json({ success: true, message: 'Queue created successfully', data: queue });
  }

  async callNext(_req, res) {
    const queue = await queueService.callNext();
    res.json({ success: true, message: 'Next patient called successfully', data: queue });
  }

  async complete(req, res) {
    const queue = await queueService.complete(req.params.id);
    res.json({ success: true, message: 'Queue marked as done successfully', data: queue });
  }
}

const queueController = new QueueController();

module.exports = { QueueController, queueController };