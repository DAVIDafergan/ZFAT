const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  category: {
    type: String,
    enum: ['מבזקים', 'קהילה וחברה', 'כלכלה', 'פוליטיקה', 'ביטחון', 'תרבות ואומנות', 'משפט ופלילים', 'מזג אוויר', 'תשתיות ותנועה', 'צפת והגליל'],
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
  publishedAt: { type: Date, default: Date.now, index: true },
  featuredAt: { type: Date, default: null },
  views: { type: Number, default: 0 },
  shortLinkCode: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
