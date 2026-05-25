const express = require('express');
const router = express.Router();
const WeeklyPaper = require('../models/WeeklyPaper');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  try {
    const papers = await WeeklyPaper.find({ isActive: true }).sort({ weekKey: -1, publishedAt: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const paper = new WeeklyPaper(req.body);
    await paper.save();
    res.status(201).json(paper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const paper = await WeeklyPaper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!paper) return res.status(404).json({ message: 'העיתון לא נמצא' });
    res.json(paper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const paper = await WeeklyPaper.findByIdAndDelete(req.params.id);
    if (!paper) return res.status(404).json({ message: 'העיתון לא נמצא' });
    res.json({ message: 'העיתון נמחק' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
