const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const readLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות לתגובות' } });
const mutateLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות ניהול תגובות' } });

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'אין הרשאה - נדרשת הרשאת מנהל' });
};

// GET /api/comments/pending  — admin only, returns unapproved comments
router.get('/pending', readLimiter, auth, isAdmin, async (req, res) => {
  try {
    const comments = await Comment.find({ approved: false }).sort({ createdAt: -1 }).lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/comments?postId=xxx — returns only approved comments
router.get('/', readLimiter, async (req, res) => {
  try {
    const rawPostId = req.query.postId;
    const filter = rawPostId
      ? { postId: String(rawPostId).slice(0, 64), approved: true }
      : { approved: true };
    const comments = await Comment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments — creates a comment pending approval
router.post('/', mutateLimiter, async (req, res) => {
  try {
    const { postId, userId, userName, content } = req.body;
    if (!postId || !userName || !content) {
      return res.status(400).json({ message: 'postId, userName, ו-content נדרשים' });
    }
    const comment = new Comment({ postId, userId, userName, content, approved: false });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/comments/:id/approve — admin approves a comment
router.patch('/:id/approve', mutateLimiter, auth, isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: 'תגובה לא נמצאה' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/comments/:id — admin deletes a comment
router.delete('/:id', mutateLimiter, auth, isAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'תגובה לא נמצאה' });
    res.json({ message: 'תגובה נמחקה בהצלחה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/comments/:id/like
router.patch('/:id/like', mutateLimiter, auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'תגובה לא נמצאה' });

    const userId = req.user.id;
    const hasLiked = comment.likedBy.includes(userId);

    if (hasLiked) {
      comment.likedBy.pull(userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
