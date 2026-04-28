import { z } from 'zod';

export const appointmentStatusValues = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const appointmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, 'patientId is required'),
  doctorId: z.string().min(1, 'doctorId is required'),
  appointmentDate: z.string().regex(dateRegex, 'appointmentDate must be in YYYY-MM-DD format'),
  appointmentTime: z.string().regex(timeRegex, 'appointmentTime must be in HH:mm format').optional(),
  reason: z.string().optional(),
  status: z.enum(appointmentStatusValues).default('scheduled'),
});

export const createAppointmentSchema = appointmentSchema.omit({ id: true });
export const updateAppointmentSchema = createAppointmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type AppointmentDto = z.infer<typeof appointmentSchema>;
export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
