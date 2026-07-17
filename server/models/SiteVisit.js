const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  visitedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

// Index for efficient queries by month
siteVisitSchema.index({ visitedAt: 1 });
siteVisitSchema.index({ postId: 1, visitedAt: 1 });

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
