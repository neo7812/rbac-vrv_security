const AuditLog = require('../models/auditLog.model');
router.post('/log-action', async (req, res) => {
  const { userId, action, details } = req.body;
  await AuditLog.create({ userId, action, details });
  res.sendStatus(200);
});
