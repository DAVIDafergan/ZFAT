const mongoose = require('mongoose');

const boardListingSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  listingCategory: {
    type: String,
    enum: ['real_estate', 'restaurants', 'synagogues', 'mikvaot', 'attractions'],
    default: 'real_estate',
  },
  location: { type: String, default: '' },
  dealType: {
    type: String,
    enum: ['rent', 'sale', 'vacation'],
    default: 'rent',
  },
  price: { type: Number, default: 0, min: 0 },
  sizeSqm: { type: Number, default: 0, min: 0 },
  details: { type: String, default: '' },
  hasBalcony: { type: Boolean, default: false },
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

boardListingSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('BoardListing', boardListingSchema);
