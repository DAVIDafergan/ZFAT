const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const WeeklyPaper = require('../models/WeeklyPaper');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const validateObjectId = require('../middleware/validateObjectId');

const listLimiter = rateLimit({ windowMs: 60 * 1000, limit: 90, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות לעיתון השבועי' } });
const mutateLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי פעולות ניהול עיתון' } });

router.get('/', listLimiter, async (req, res) => {
  try {
    const papers = await WeeklyPaper.find({ isActive: true }).sort({ weekKey: -1, publishedAt: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', mutateLimiter, auth, adminOnly, async (req, res) => {
  try {
    const paper = new WeeklyPaper(req.body);
    await paper.save();
    res.status(201).json(paper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const paper = await WeeklyPaper.findById(objectId);
    if (!paper) return res.status(404).json({ message: 'העיתון לא נמצא' });
    paper.set(req.body);
    await paper.save();
    res.json(paper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const paper = await WeeklyPaper.findByIdAndDelete(objectId);
    if (!paper) return res.status(404).json({ message: 'העיתון לא נמצא' });
    res.json({ message: 'העיתון נמחק' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
