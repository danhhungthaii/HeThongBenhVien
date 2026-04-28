import { z } from 'zod';

export const queueStatusValues = ['waiting', 'serving', 'done', 'cancelled'] as const;

export const takeQueueNumberSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
});

export const queueSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, 'patientId is required'),
  queueNumber: z.number().int().positive(),
  status: z.enum(queueStatusValues).default('waiting'),
  createdAt: z.string().datetime(),
});

export const createQueueSchema = takeQueueNumberSchema;

export type QueueDto = z.infer<typeof queueSchema>;
export type CreateQueueDto = z.infer<typeof createQueueSchema>;
export type TakeQueueNumberDto = z.infer<typeof takeQueueNumberSchema>;
