const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// POST /api/subscribers
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'אימייל נדרש' });

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'כתובת אימייל כבר רשומה' });

    const subscriber = new NewsletterSubscriber({ email, isActive: true });
    await subscriber.save();
    res.status(201).json({ message: 'נרשמת בהצלחה!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/subscribers (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
