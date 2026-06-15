const mongoose = require('mongoose');

const coerceDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  category: {
    type: String,
    enum: ['מבזקים', 'קהילה וחברה', 'כלכלה', 'פוליטיקה', 'ביטחון', 'תרבות ואומנות', 'משפט ופלילים', 'בריאות', 'מזג אוויר', 'תשתיות ותנועה', 'צפת והגליל', 'בתי כנסת בצפת', 'מסעדות כשרות', 'מקוואות', 'אטרקציות', 'שמחות'],
    default: 'מבזקים'
  },
  author: { type: String, default: 'מערכת' },
  imageUrl: { type: String, default: '' },
  images: [{
    url: { type: String, default: '' },
    photographer: { type: String, default: '' },
  }],
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now, required: true, index: true },
  featuredAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
  shortLinkCode: { type: String, default: '' }
}, { timestamps: true });

postSchema.pre('validate', function setPublishedAtFallback(next) {
  if (!coerceDate(this.publishedAt)) {
    const createdAtFallback = coerceDate(this.createdAt);
    const legacyDateFallback = coerceDate(this.get('date'));
    this.publishedAt = createdAtFallback || legacyDateFallback;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
