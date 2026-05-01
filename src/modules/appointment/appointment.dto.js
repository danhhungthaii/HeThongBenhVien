const { z } = require('zod');

const appointmentStatusValues = ['scheduled', 'completed', 'cancelled', 'no_show'];

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const appointmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, 'patientId is required'),
  doctorId: z.string().min(1, 'doctorId is required'),
  appointmentDate: z.string().regex(dateRegex, 'appointmentDate must be in YYYY-MM-DD format'),
  appointmentTime: z.string().regex(timeRegex, 'appointmentTime must be in HH:mm format').optional(),
  reason: z.string().optional(),
  status: z.enum(appointmentStatusValues).default('scheduled'),
});

const createAppointmentSchema = appointmentSchema.omit({ id: true });
const updateAppointmentSchema = createAppointmentSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

module.exports = {
  appointmentStatusValues,
  appointmentSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
};