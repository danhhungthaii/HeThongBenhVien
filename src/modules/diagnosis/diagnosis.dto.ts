import { z } from 'zod';

export const diagnosisSchema = z.object({
  id: z.string().min(1),
  encounterId: z.string().min(1, 'encounterId is required'),
  code: z.string().min(1, 'code is required').max(50),
  name: z.string().min(2, 'name is required').max(255),
  note: z.string().max(500).optional(),
});

export const createDiagnosisSchema = diagnosisSchema.omit({ id: true });

export type DiagnosisDto = z.infer<typeof diagnosisSchema>;
export type CreateDiagnosisDto = z.infer<typeof createDiagnosisSchema>;
