'use strict';
const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/auth/routes/auth.routes'));
router.use('/rbac', require('../modules/rbac/routes/rbac.routes'));
router.use('/master-data', require('../modules/master-data/routes/masterData.routes'));
router.use('/audit-logs', require('../modules/audit/routes/audit.routes'));
router.use('/system-config', require('../modules/system-config/routes/systemConfig.routes'));
router.use('/patients', require('../modules/patient/routes/patient.routes'));
router.use('/appointments', require('../modules/appointment/routes/appointment.routes'));
router.use('/queue', require('../modules/queue/routes/queue.routes'));
router.use('/encounters', require('../modules/encounter/routes/encounter.routes'));
router.use('/emr', require('../modules/emr/routes/emr.routes'));

module.exports = router;
