const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
