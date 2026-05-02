const { z } = require('zod');

const patientStatusValues = ['active', 'inactive'];
const patientGenderValues = ['male', 'female', 'other'];

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const patientSchema = z.object({
  id: z.string().min(1),
  pid: z.string().min(1),
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
  deletedAt: z.string().datetime().optional(),
});

const createPatientSchema = patientSchema.omit({ id: true, pid: true, deletedAt: true });
const updatePatientSchema = createPatientSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

module.exports = {
  patientStatusValues,
  patientGenderValues,
  patientSchema,
  createPatientSchema,
  updatePatientSchema,
};