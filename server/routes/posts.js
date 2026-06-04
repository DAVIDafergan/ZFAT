const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { editorOrAbove, adminOnly } = require('../middleware/adminOnly');
const { generateShortCode, normalizeShortCode } = require('../utils/shortLink');
const validateObjectId = require('../middleware/validateObjectId');

const listLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות לכתבות' } });
const mutateLimiter = rateLimit({ windowMs: 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי פעולות ניהול כתבות' } });

router.get('/', listLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(),
    ]);

    if (process.env.LOG_POST_ORDER === 'true') {
      console.log('[posts:list] ordered timestamps', posts.map((post) => ({
        title: post.title,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
      })));
    }

    res.json({ data: posts, page, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', listLimiter, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const post = await Post.findById(objectId).lean();
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', mutateLimiter, auth, editorOrAbove, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      shortLinkCode: normalizeShortCode(req.body.shortLinkCode, Date.now().toString()) || generateShortCode(),
      publishedAt: new Date(),
    };
    delete payload.date;
    delete payload.published_at;
    delete payload.created_at;
    delete payload.updated_at;
    if (payload.isFeatured) {
      payload.featuredAt = new Date();
    } else {
      payload.featuredAt = null;
    }
    const post = new Post(payload);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', mutateLimiter, auth, editorOrAbove, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const updates = {
      ...req.body,
      ...(req.body.shortLinkCode ? { shortLinkCode: normalizeShortCode(req.body.shortLinkCode, req.params.id) } : {}),
    };
    delete updates.date;
    delete updates.publishedAt;
    delete updates.published_at;
    delete updates.createdAt;
    delete updates.created_at;
    delete updates.updatedAt;
    delete updates.updated_at;
    const post = await Post.findById(objectId);
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });

    // Track when a post is first featured; clear the timestamp when unfeatured
    if ('isFeatured' in updates) {
      if (updates.isFeatured && !post.isFeatured) {
        updates.featuredAt = new Date();
      } else if (!updates.isFeatured) {
        updates.featuredAt = null;
      }
    }

    post.set(updates);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const post = await Post.findByIdAndDelete(objectId);
    if (!post) return res.status(404).json({ message: 'כתבה לא נמצאה' });
    res.json({ message: 'כתבה נמחקה' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/views', listLimiter, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const post = await Post.findByIdAndUpdate(objectId, { $inc: { views: 1 } }, { new: true });
    res.json({ views: post?.views || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
