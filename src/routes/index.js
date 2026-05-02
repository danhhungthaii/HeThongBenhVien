const { Router } = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const appointmentRoutes = require('../modules/appointment/appointment.routes');
const patientRoutes = require('../modules/patient/patient.routes');
const queueRoutes = require('../modules/queue/queue.routes');
const encounterRoutes = require('../modules/encounter/encounter.routes');
const masterDataRoutes = require('../modules/master-data/masterData.routes');
const auditRoutes = require('../modules/audit/audit.routes');
const emrRoutes = require('../modules/emr/emr.routes');
const rbacRoutes = require('../modules/rbac/rbac.routes');
const systemConfigRoutes = require('../modules/system-config/systemConfig.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queue', queueRoutes);
router.use('/encounters', encounterRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/audit', auditRoutes);
router.use('/emr', emrRoutes);
router.use('/rbac', rbacRoutes);
router.use('/system-config', systemConfigRoutes);

module.exports = router;