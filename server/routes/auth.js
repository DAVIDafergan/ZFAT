const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'כל השדות נדרשים' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'אימייל כבר קיים במערכת' });

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashed, role: 'user' });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAuthenticated: true }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'אימייל וסיסמה נדרשים' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAuthenticated: true }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'משתמש לא נמצא' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, isAuthenticated: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
