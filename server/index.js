require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Post = require('./models/Post');
const { normalizeShortCode } = require('./utils/shortLink');
const escapeHtml = require('./utils/escapeHtml');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/zfat-news';
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()).filter(Boolean) : []),
];

const shortLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות לקישורים קצרים' },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/weekly-papers', require('./routes/weeklyPapers'));
app.use('/api/board-listings', require('./routes/boardListings'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.get('/p/:shortCode', shortLinkLimiter, async (req, res) => {
  try {
    const requestedCode = normalizeShortCode(req.params.shortCode);
    if (!requestedCode) return res.status(404).send('Short link not found');

    let post = await Post.findOne({ shortLinkCode: requestedCode }).lean();
    if (!post) {
      const candidates = await Post.find({ shortLinkCode: { $exists: true, $ne: '' } })
        .select('title excerpt imageUrl shortLinkCode createdAt')
        .lean();
      post = candidates.find(candidate => normalizeShortCode(candidate.shortLinkCode, candidate._id?.toString()) === requestedCode);
    }

    if (!post) return res.status(404).send('Short link not found');

    const title = escapeHtml(post.title || 'צפת בתנופה');
    const description = escapeHtml(post.excerpt || 'כתבה מתוך אתר צפת בתנופה');
    const image = escapeHtml(post.imageUrl || `${publicSiteUrl}/favicon.ico`);
    const articleUrl = `${publicSiteUrl}/#/article/${post._id}`;
    const shortUrl = `${publicSiteUrl}/p/${requestedCode}`;

    res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="צפת בתנופה" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${shortUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta http-equiv="refresh" content="0; url=${articleUrl}" />
    <link rel="canonical" href="${shortUrl}" />
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;color:#111827;margin:0}a{color:#b91c1c;font-weight:700}</style>
  </head>
  <body>
    <main>
      <p>מעבירים אתכם לכתבה… <a href="${articleUrl}">לחצו כאן אם לא הופניתם אוטומטית</a></p>
    </main>
  </body>
</html>`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
