const mongoose = require('mongoose');

const adSlideSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' }
}, { _id: false });

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  area: {
    type: String,
    enum: [
      'leaderboard',
      'homepage_mid',
      'homepage_feed',
      'sidebar',
      'sidebar_video',
      'article_inline',
      'article_bottom',
      'category_top',
      'category_mid',
      'weekly_top',
      'board_top',
      'contact_top',
      'search_top',
    ],
    required: true
  },
  isActive: { type: Boolean, default: true },
  slides: [adSlideSchema]
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
