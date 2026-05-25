const mongoose = require('mongoose');

const boardListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  location: { type: String, required: true },
  dealType: {
    type: String,
    enum: ['rent', 'sale'],
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  sizeSqm: { type: Number, required: true, min: 0 },
  details: { type: String, default: '' },
  hasBalcony: { type: Boolean, default: false },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BoardListing', boardListingSchema);
