import { Router } from 'express';

import appointmentRoutes from '../modules/appointment/appointment.routes';
import patientRoutes from '../modules/patient/patient.routes';
import queueRoutes from '../modules/queue/queue.routes';

const router = Router();

router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queues', queueRoutes);

export default router;
