const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// GET /api/comments?postId=xxx
router.get('/', async (req, res) => {
  try {
    const filter = req.query.postId ? { postId: req.query.postId } : {};
    const comments = await Comment.find(filter).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments
router.post('/', async (req, res) => {
  try {
    const { postId, userId, userName, content } = req.body;
    if (!postId || !userName || !content) {
      return res.status(400).json({ message: 'postId, userName, ו-content נדרשים' });
    }
    const comment = new Comment({ postId, userId, userName, content });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/comments/:id/like
router.patch('/:id/like', auth, async (req, res) => {
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
