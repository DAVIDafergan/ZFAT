const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// GET /api/ads
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ads (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/ads/:id (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: 'פרסומת לא נמצאה' });
    res.json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/ads/:id (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: 'פרסומת לא נמצאה' });
    res.json({ message: 'פרסומת נמחקה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
