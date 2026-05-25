const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'יותר מדי ניסיונות הרשמה, נסו שוב בעוד כמה דקות',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'יותר מדי ניסיונות התחברות, נסו שוב בעוד כמה דקות',
});

const adminUsersLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'יותר מדי בקשות לרשימת המשתמשים',
});

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.warn('[Auth][Register] Missing required fields');
      return res.status(400).json({ message: 'כל השדות נדרשים' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.warn('[Auth][Register] Duplicate email attempt', { email: normalizedEmail });
      return res.status(409).json({ message: 'אימייל כבר קיים במערכת' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name: name.trim(), email: normalizedEmail, password: hashed, role: 'user' });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAuthenticated: true }
    });
  } catch (err) {
    console.error('[Auth][Register] Unexpected error', {
      message: err.message,
      stack: err.stack,
      bodyKeys: Object.keys(req.body || {}),
    });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, usernameOrEmail, password } = req.body;
    const rawIdentifier = (usernameOrEmail || email || '').trim();
    if (!rawIdentifier || !password) {
      console.warn('[Auth][Login] Missing credentials');
      return res.status(400).json({ message: 'אימייל וסיסמה נדרשים' });
    }
    const normalizedEmail = rawIdentifier.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { name: rawIdentifier },
      ],
    });
    if (!user) {
      console.warn('[Auth][Login] Unknown user', { identifier: rawIdentifier });
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[Auth][Login] Invalid password', { identifier: rawIdentifier });
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAuthenticated: true }
    });
  } catch (err) {
    console.error('[Auth][Login] Unexpected error', {
      message: err.message,
      stack: err.stack,
      bodyKeys: Object.keys(req.body || {}),
    });
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', adminUsersLimiter, auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('[Auth][Users] Unexpected error', {
      message: err.message,
      stack: err.stack,
      requesterId: req.user?.id,
    });
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
    console.error('[Auth][Me] Unexpected error', {
      message: err.message,
      stack: err.stack,
      requesterId: req.user?.id,
    });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
