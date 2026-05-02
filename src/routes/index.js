const { Router } = require('express');

const appointmentRoutes = require('../modules/appointment/appointment.routes');
const patientRoutes = require('../modules/patient/patient.routes');
const queueRoutes = require('../modules/queue/queue.routes');

const router = Router();

router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queues', queueRoutes);

module.exports = router;