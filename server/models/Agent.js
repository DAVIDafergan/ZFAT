const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
