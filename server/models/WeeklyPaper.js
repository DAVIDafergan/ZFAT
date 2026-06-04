const mongoose = require('mongoose');

const weeklyPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hebrewDate: { type: String, default: '', trim: true },
  weekKey: { type: String, default: '', index: true },
  description: { type: String, default: '' },
  pdfUrl: { type: String, required: true },
  coverImageUrl: { type: String, default: '' },
  publishedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

weeklyPaperSchema.index({ isActive: 1, publishedAt: -1 });

module.exports = mongoose.model('WeeklyPaper', weeklyPaperSchema);
