const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const SiteVisit = require('../models/SiteVisit');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const statsLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות לסטטיסטיקות' } });
const visitLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות לרישום ביקורים' } });
const RECENT_POST_DAYS = 30;

const randomIntInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Get site statistics (admin only)
router.get('/stats', statsLimiter, auth, adminOnly, async (req, res) => {
  try {
    // Get total articles count
    const totalArticles = await Post.countDocuments({});

    // Get total comments count (only approved when moderation exists)
    const totalComments = await Comment.countDocuments({ approved: true });

    // Get total post views
    const viewsAggregation = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$views', 0] } } } }
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    // Get newsletter subscribers count
    const newsletterSubscribers = await NewsletterSubscriber.countDocuments({ isActive: true });

    // Get total visits with baseline offset
    const realTotalVisits = await SiteVisit.countDocuments({});
    const totalVisits = realTotalVisits + 1600;

    // Get visits by month for the last 12 months
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const visitsByMonth = await SiteVisit.aggregate([
      {
        $match: {
          visitedAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitedAt' },
            month: { $month: '$visitedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format visitsByMonth for frontend
    const formattedVisitsByMonth = visitsByMonth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
      monthLabel: new Date(item._id.year, item._id.month - 1).toLocaleDateString('he-IL', { 
        month: 'long', 
        year: 'numeric' 
      })
    }));

    // Get top articles by views
    const topArticles = await Post.find({})
      .select('title views publishedAt')
      .sort({ views: -1 })
      .limit(5)
      .lean();

    res.json({
      totalArticles,
      totalViews,
      totalComments,
      newsletterSubscribers,
      totalVisits,
      visitsByMonth: formattedVisitsByMonth,
      topArticles
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Log a site visit (public)
router.post('/visit', visitLimiter, async (_req, res) => {
  try {
    const visit = new SiteVisit({
      visitedAt: new Date()
    });

    await visit.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error logging visit:', err);
    res.status(500).json({ message: err.message });
  }
});

// Backward-compatible legacy route
router.post('/visits', visitLimiter, async (_req, res) => {
  try {
    const visit = new SiteVisit({ visitedAt: new Date() });
    await visit.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error logging visit:', err);
    res.status(500).json({ message: err.message });
  }
});

// Reset visits counter (admin only)
router.post('/reset-visits', statsLimiter, auth, adminOnly, async (_req, res) => {
  try {
    await SiteVisit.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error('Error resetting visits:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/normalize-views', statsLimiter, auth, adminOnly, async (_req, res) => {
  try {
    const posts = await Post.find({})
      .select('_id views publishedAt createdAt')
      .sort({ views: -1, publishedAt: -1, createdAt: -1 })
      .lean();

    if (posts.length === 0) {
      return res.json({ success: true, matchedCount: 0, modifiedCount: 0 });
    }

    const recentThreshold = new Date(Date.now() - RECENT_POST_DAYS * 24 * 60 * 60 * 1000);
    const topPostCount = Math.min(5, posts.length);
    const topViewValues = Array.from({ length: topPostCount }, () => randomIntInRange(700, 1200)).sort((a, b) => b - a);
    const operations = posts.map((post, index) => {
      let nextViews;

      if (index < topPostCount) {
        nextViews = topViewValues[index];
      } else {
        const postDate = post.publishedAt || post.createdAt;
        const isRecent = postDate && new Date(postDate) >= recentThreshold;
        nextViews = isRecent ? randomIntInRange(150, 450) : randomIntInRange(300, 900);
      }

      return {
        updateOne: {
          filter: { _id: post._id },
          update: { $set: { views: nextViews } },
        },
      };
    });

    const result = await Post.bulkWrite(operations, { ordered: false });
    req.app.locals.invalidateCache?.('posts');
    res.json({
      success: true,
      matchedCount: result.matchedCount || posts.length,
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error('Error normalizing views:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
