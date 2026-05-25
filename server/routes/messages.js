const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// GET /api/messages (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'כל השדות החובה נדרשים' });
    }
    const msg = new ContactMessage({ name, email, subject, message, phone });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
