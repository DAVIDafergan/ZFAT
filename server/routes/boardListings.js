const express = require('express');
const router = express.Router();
const BoardListing = require('../models/BoardListing');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  try {
    const listings = await BoardListing.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const listing = new BoardListing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const listing = await BoardListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'המודעה לא נמצאה' });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const listing = await BoardListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'המודעה לא נמצאה' });
    res.json({ message: 'המודעה נמחקה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
