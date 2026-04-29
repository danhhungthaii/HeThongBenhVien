import { z } from 'zod';

export const encounterStatusValues = ['open', 'closed'] as const;

export const encounterSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, 'patientId is required'),
  encounterDate: z.string().min(1, 'encounterDate is required'),
  chiefComplaint: z.string().min(2).max(255).optional(),
  status: z.enum(encounterStatusValues).default('open'),
});

export const createEncounterSchema = encounterSchema.omit({ id: true });

export type EncounterDto = z.infer<typeof encounterSchema>;
export type CreateEncounterDto = z.infer<typeof createEncounterSchema>;
