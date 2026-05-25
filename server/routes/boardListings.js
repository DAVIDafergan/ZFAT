const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const BoardListing = require('../models/BoardListing');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const validateObjectId = require('../middleware/validateObjectId');

const listLimiter = rateLimit({ windowMs: 60 * 1000, limit: 90, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות ללוח בתנופה' } });
const mutateLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי פעולות ניהול לוח' } });

router.get('/', listLimiter, async (req, res) => {
  try {
    const listings = await BoardListing.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', mutateLimiter, auth, adminOnly, async (req, res) => {
  try {
    const listing = new BoardListing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const listing = await BoardListing.findById(objectId);
    if (!listing) return res.status(404).json({ message: 'המודעה לא נמצאה' });
    listing.set(req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const listing = await BoardListing.findByIdAndDelete(objectId);
    if (!listing) return res.status(404).json({ message: 'המודעה לא נמצאה' });
    res.json({ message: 'המודעה נמחקה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
