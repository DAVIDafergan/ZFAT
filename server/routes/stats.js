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

// Get site statistics (admin only)
router.get('/stats', statsLimiter, auth, adminOnly, async (req, res) => {
  try {
    // Get active articles count (where isFeatured is true)
    const activeArticles = await Post.countDocuments({ isFeatured: true });

    // Get total articles count
    const totalArticles = await Post.countDocuments({});

    // Get total comments count
    const totalComments = await Comment.countDocuments({});

    // Get newsletter subscribers count
    const newsletterSubscribers = await NewsletterSubscriber.countDocuments({ isActive: true });

    // Get total visits (offset by 1151 to start counter from that baseline)
    const totalVisits = await SiteVisit.countDocuments({}) + 1151;

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
      .limit(10)
      .lean();

    res.json({
      activeArticles,
      totalArticles,
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

// Log a visit (called when article is viewed)
router.post('/visits', visitLimiter, async (req, res) => {
  try {
    const { postId } = req.body;

    const visit = new SiteVisit({
      postId: postId || null,
      visitedAt: new Date()
    });

    await visit.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error logging visit:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
