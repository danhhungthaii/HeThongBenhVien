const { z } = require('zod');

const queueStatusValues = ['waiting', 'serving', 'done', 'cancelled'];

const takeQueueNumberSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
});

const queueSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, 'patientId is required'),
  queueNumber: z.number().int().positive(),
  status: z.enum(queueStatusValues).default('waiting'),
  createdAt: z.string().datetime(),
});

const createQueueSchema = takeQueueNumberSchema;

module.exports = {
  queueStatusValues,
  takeQueueNumberSchema,
  queueSchema,
  createQueueSchema,
};