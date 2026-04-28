import { z } from 'zod';

export const patientStatusValues = ['active', 'inactive'] as const;
export const patientGenderValues = ['male', 'female', 'other'] as const;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const patientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name must contain at least 2 characters').max(100, 'Name is too long'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9+()\-\s]+$/, 'Phone number contains invalid characters'),
  dateOfBirth: z.string().regex(dateRegex, 'dateOfBirth must be in YYYY-MM-DD format').optional(),
  gender: z.enum(patientGenderValues).optional(),
  address: z.string().max(255, 'Address is too long').optional(),
  status: z.enum(patientStatusValues).default('active'),
});

export const createPatientSchema = patientSchema.omit({ id: true });
export const updatePatientSchema = createPatientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type PatientDto = z.infer<typeof patientSchema>;
export type CreatePatientDto = z.infer<typeof createPatientSchema>;
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;
