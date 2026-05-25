require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const Post = require('./models/Post');
const User = require('./models/User');
const { normalizeShortCode } = require('./utils/shortLink');
const escapeHtml = require('./utils/escapeHtml');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI;
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://zfat-production.up.railway.app').replace(/\/$/, '');
const distDir = path.join(__dirname, '../dist');
const distIndexPath = path.join(distDir, 'index.html');
const hasDistIndex = fs.existsSync(distIndexPath);
const defaultAdminName = (process.env.ADMIN_NAME || 'ניהול').trim();
const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'ZP@GMAIL.COM').trim().toLowerCase();
const defaultAdminPassword = process.env.ADMIN_PASSWORD || '1234567';
const mongoStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const allowedOrigins = Array.from(new Set([
  publicSiteUrl,
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()).filter(Boolean) : []),
  ...(process.env.PUBLIC_SITE_URL ? process.env.PUBLIC_SITE_URL.split(',').map(origin => origin.trim()).filter(Boolean) : []),
].filter(Boolean)));

const shortLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות לקישורים קצרים' },
});
const spaFallbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות לדפי האתר' },
});

if (!hasDistIndex) {
  console.error(`[Startup] Missing frontend build file at ${distIndexPath}`);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));

const getMongoStatus = () => ({
  state: mongoStateLabels[mongoose.connection.readyState] || 'unknown',
  readyState: mongoose.connection.readyState,
});

app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/weekly-papers', require('./routes/weeklyPapers'));
app.use('/api/board-listings', require('./routes/boardListings'));

app.get('/health', (req, res) => {
  const database = getMongoStatus();
  res.json({
    status: database.state === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date(),
    database,
  });
});

const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: defaultAdminEmail });
  if (existingAdmin) return;

  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 12);
  await User.create({
    name: defaultAdminName,
    email: defaultAdminEmail,
    password: hashedPassword,
    role: 'admin',
  });
  console.log(`✅ Default admin ensured: ${defaultAdminEmail}`);
};

app.get('/p/:shortCode', shortLinkLimiter, async (req, res) => {
  try {
    const requestedCode = normalizeShortCode(req.params.shortCode);
    if (!requestedCode) return res.status(404).json({ message: 'Short link not found' });

    let post = await Post.findOne({ shortLinkCode: requestedCode }).lean();
    if (!post) {
      const candidates = await Post.find({ shortLinkCode: { $exists: true, $ne: '' } })
        .select('title excerpt imageUrl shortLinkCode createdAt')
        .lean();
      post = candidates.find(candidate => normalizeShortCode(candidate.shortLinkCode, candidate._id?.toString()) === requestedCode);
    }

    if (!post) return res.status(404).json({ message: 'Short link not found' });

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
    res.status(500).json({ message: err.message });
  }
});

app.use(express.static(distDir));

app.get('*', spaFallbackLimiter, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (!hasDistIndex) {
    return res.status(503).json({ message: 'Frontend build not available yet' });
  }
  return res.sendFile(distIndexPath);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.status || (err.message === 'Not allowed by CORS' ? 403 : 500);
  console.error('[Express] Unhandled error', {
    path: req.path,
    method: req.method,
    statusCode,
    message: err.message,
  });
  res.status(statusCode).json({ message: err.message || 'Internal server error' });
});

if (!MONGO_URI) {
  console.error('❌ Startup error: MONGO_URL/MONGODB_URI is missing');
  process.exit(1);
}

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

mongoose.connect(MONGO_URI)
  .then(() => ensureDefaultAdmin())
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Static frontend path: ${distDir}`);
    });
    server.on('error', (error) => {
      console.error('❌ Startup server error:', error);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('❌ Startup error:', err);
    process.exit(1);
  });
