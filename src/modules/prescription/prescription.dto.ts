import { z } from 'zod';

export const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'medicineName is required').max(255),
  dosage: z.string().min(1, 'dosage is required').max(100),
  frequency: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
});

export const prescriptionSchema = z.object({
  id: z.string().min(1),
  encounterId: z.string().min(1, 'encounterId is required'),
  items: z.array(prescriptionItemSchema).min(1, 'items is required'),
  note: z.string().max(500).optional(),
});

export const createPrescriptionSchema = prescriptionSchema.omit({ id: true });

export type PrescriptionDto = z.infer<typeof prescriptionSchema>;
export type CreatePrescriptionDto = z.infer<typeof createPrescriptionSchema>;
