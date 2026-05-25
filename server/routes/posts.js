const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { editorOrAbove, adminOnly } = require('../middleware/adminOnly');
const { generateShortCode, normalizeShortCode } = require('../utils/shortLink');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(),
    ]);

    res.json({ data: posts, page, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, editorOrAbove, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      shortLinkCode: normalizeShortCode(req.body.shortLinkCode, Date.now().toString()) || generateShortCode(),
    };
    const post = new Post(payload);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, editorOrAbove, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      ...(req.body.shortLinkCode ? { shortLinkCode: normalizeShortCode(req.body.shortLinkCode, req.params.id) } : {}),
    };
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });
    res.json({ message: 'כתבה נמחקה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/views', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: post?.views || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
