import { Router } from 'express';

import appointmentRoutes from '../modules/appointment/appointment.routes';
import diagnosisRoutes from '../modules/diagnosis/diagnosis.routes';
import encounterRoutes from '../modules/encounter/encounter.routes';
import patientRoutes from '../modules/patient/patient.routes';
import prescriptionRoutes from '../modules/prescription/prescription.routes';
import queueRoutes from '../modules/queue/queue.routes';

const router = Router();

router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queues', queueRoutes);
router.use('/encounters', encounterRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/prescriptions', prescriptionRoutes);

export default router;
