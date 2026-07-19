require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('./models/Post');
const User = require('./models/User');
const { normalizeShortCode } = require('./utils/shortLink');
const escapeHtml = require('./utils/escapeHtml');

// ── In-memory cache ──────────────────────────────────────────────
const cache = {
  posts: { data: null, ts: 0 },
  ads: { data: null, ts: 0 },
};
const CACHE_TTL_MS = 60_000;
const DEFAULT_PUBLIC_SITE_URL = 'https://zfatbitnufa.com';

const getCached = (key) => {
  const entry = cache[key];
  if (entry?.data && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
};

const setCached = (key, data) => {
  cache[key] = { data, ts: Date.now() };
};

const invalidateCache = (key) => {
  if (cache[key]) cache[key] = { data: null, ts: 0 };
};

const warmCache = async () => {
  try {
    const Ad = require('./models/Ad');
    const [posts, ads] = await Promise.all([
      Post.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean(),
      Ad.find({}).lean(),
    ]);
    setCached('posts', posts);
    setCached('ads', ads);
    console.log(`🔥 Cache warmed: ${posts.length} posts, ${ads.length} ads`);
  } catch (err) {
    console.error('❌ Cache warm-up failed:', err.message);
  }
};
// ─────────────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1);
app.locals.invalidateCache = invalidateCache;
const PORT = Number(process.env.PORT || 3001);
const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI;
const JWT_SECRET = (process.env.JWT_SECRET || '').trim();
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_PUBLIC_SITE_URL).replace(/\/$/, '');
const distDir = path.join(__dirname, '../dist');
const distIndexPath = path.join(distDir, 'index.html');
const hasDistIndex = fs.existsSync(distIndexPath);
const defaultAdminName = (process.env.ADMIN_NAME || 'ניהול').trim();
const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'ZP@GMAIL.COM').trim().toLowerCase();
const defaultAdminPassword = process.env.ADMIN_PASSWORD || '1234567';
const DEFAULT_SITE_REVEAL_AT = '2026-07-04T18:49:15.123Z';
const siteRevealAtRaw = `${process.env.SITE_REVEAL_AT || DEFAULT_SITE_REVEAL_AT}`.trim();
const siteRevealAtMs = new Date(siteRevealAtRaw).getTime();
const mongoStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const splitEnvList = (value = '') => value.split(',').map(item => item.trim()).filter(Boolean);

const normalizeOrigin = (value = '') => {
  const trimmed = `${value || ''}`.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return trimmed.replace(/\/$/, '').toLowerCase();
  }
};

const expandOriginVariants = (value = '') => {
  const normalized = normalizeOrigin(value);
  if (!normalized) return [];
  try {
    const parsed = new URL(normalized);
    const host = parsed.host.toLowerCase();
    const variants = new Set([`${parsed.protocol}//${host}`]);
    if (host.startsWith('www.')) {
      variants.add(`${parsed.protocol}//${host.slice(4)}`);
    } else {
      variants.add(`${parsed.protocol}//www.${host}`);
    }
    return [...variants];
  } catch {
    return [normalized];
  }
};

const allowedOrigins = Array.from(new Set([
  'https://zfatbitnufa.com',
  'https://www.zfatbitnufa.com',
  publicSiteUrl,
  ...splitEnvList(process.env.FRONTEND_URL),
  ...splitEnvList(process.env.PUBLIC_SITE_URL),
  ...splitEnvList(process.env.CORS_ALLOWED_ORIGINS),
].flatMap(expandOriginVariants).filter(Boolean)));

const toAbsoluteUrl = (value, baseUrl) => {
  const raw = `${value || ''}`.trim();
  if (!raw) return '';
  if (raw.startsWith('//')) return `https:${raw}`;
  try {
    return new URL(raw).toString();
  } catch {
    try {
      return new URL(raw, `${baseUrl}/`).toString();
    } catch {
      return raw;
    }
  }
};

const resolveShareImage = ({ rawImage, postId, fallbackImage }) => {
  const cleaned = `${rawImage || ''}`.trim();
  if (!cleaned) return fallbackImage;
  if (cleaned.startsWith('data:')) return `${publicSiteUrl}/api/posts/${postId}/og-image`;
  return toAbsoluteUrl(cleaned, publicSiteUrl) || fallbackImage;
};

const imageMimeTypeByExtension = {
  '.apng': 'image/apng',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const resolveShareImageType = ({ rawImage, fallbackImage }) => {
  const cleaned = `${rawImage || ''}`.trim();
  if (cleaned.startsWith('data:')) {
    const matches = cleaned.match(/^data:([^;]+);/i);
    if (matches?.[1]) return matches[1].toLowerCase();
  }

  const targetImage = cleaned || fallbackImage;
  const absoluteImage = toAbsoluteUrl(targetImage, publicSiteUrl);
  if (!absoluteImage) return '';

  try {
    const parsed = new URL(absoluteImage);
    const extension = path.extname(parsed.pathname || '').toLowerCase();
    return imageMimeTypeByExtension[extension] || '';
  } catch {
    return '';
  }
};

const sendSimpleHtmlPage = ({ res, statusCode, title, message, redirectUrl, linkLabel }) => {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeRedirectUrl = escapeHtml(redirectUrl);
  const safeLinkLabel = escapeHtml(linkLabel);
  res.status(statusCode).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <meta http-equiv="refresh" content="3; url=${safeRedirectUrl}" />
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;color:#111827;margin:0;padding:24px;text-align:center}main{max-width:32rem;background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:32px;box-shadow:0 10px 30px rgba(15,23,42,.08)}h1{margin:0 0 12px;font-size:1.75rem}p{margin:0 0 20px;line-height:1.7}a{display:inline-flex;align-items:center;justify-content:center;padding:12px 20px;border-radius:999px;background:#b91c1c;color:#fff;text-decoration:none;font-weight:700}</style>
  </head>
  <body>
    <main>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <a href="${safeRedirectUrl}">${safeLinkLabel}</a>
    </main>
  </body>
</html>`);
};

const sendShareErrorPage = (res, statusCode, message) => sendSimpleHtmlPage({
  res,
  statusCode,
  title: 'הקישור אינו זמין',
  message,
  redirectUrl: publicSiteUrl,
  linkLabel: 'חזרה לעמוד הבית',
});

const sendShareRedirectPage = ({ res, title, description, image, imageType, pageUrl, redirectUrl }) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeImageType = escapeHtml(imageType);
  const safePageUrl = escapeHtml(pageUrl);
  const safeRedirectUrl = escapeHtml(redirectUrl);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="צפת בתנופה" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:url" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ${safeImageType ? `<meta property="og:image:type" content="${safeImageType}" />` : ''}
    <meta property="og:url" content="${safePageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    <link rel="canonical" href="${safePageUrl}" />
    <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
    <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6;color:#111827;margin:0}a{color:#b91c1c;font-weight:700}</style>
  </head>
  <body>
    <main>
      <p>מעבירים אתכם לכתבה… <a href="${safeRedirectUrl}">לחצו כאן אם לא הופניתם אוטומטית</a></p>
    </main>
  </body>
</html>`);
};

const shortLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות לקישורים קצרים' },
});
const postsListLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות לכתבות' },
});
const adsListLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי בקשות למודעות' },
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

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin);
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      const error = new Error(`Origin ${origin} is not allowed by CORS`);
      error.status = 403;
      callback(error);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use('/api', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

const isLaunchLocked = () => Number.isFinite(siteRevealAtMs) && Date.now() < siteRevealAtMs;

const getUserFromAuthorizationHeader = (req) => {
  const authHeader = `${req.get('authorization') || ''}`;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

app.get('/api/launch-status', (req, res) => {
  const launchLocked = isLaunchLocked();
  const revealAt = Number.isFinite(siteRevealAtMs) ? new Date(siteRevealAtMs).toISOString() : null;
  res.json({
    launchLocked,
    revealAt,
    remainingMs: launchLocked && Number.isFinite(siteRevealAtMs) ? Math.max(0, siteRevealAtMs - Date.now()) : 0,
  });
});

app.use((req, res, next) => {
  if (!isLaunchLocked()) return next();
  if (req.path === '/health') return next();
  if (req.path === '/api/launch-status') return next();
  if (req.path === '/api/auth/login' || req.path === '/api/auth/me') return next();

  const authenticatedUser = getUserFromAuthorizationHeader(req);
  if (authenticatedUser?.role === 'admin') {
    req.user = req.user || authenticatedUser;
    return next();
  }

  if (req.path.startsWith('/api')) {
    return res.status(423).json({
      message: 'האתר ייפתח בקרוב. ההתחברות פתוחה כעת למנהל בלבד.',
      revealAt: Number.isFinite(siteRevealAtMs) ? new Date(siteRevealAtMs).toISOString() : null,
    });
  }

  if (req.path.startsWith('/p/') || req.path.startsWith('/share/article/')) {
    return sendShareErrorPage(res, 423, 'האתר ייפתח בקרוב. הגישה לכתבות תתאפשר לאחר ההשקה.');
  }

  return next();
});

const getMongoStatus = () => ({
  state: mongoStateLabels[mongoose.connection.readyState] || 'unknown',
  readyState: mongoose.connection.readyState,
});

// ── Cached GET routes ────────────────────────────────────────────
app.get('/api/posts', postsListLimiter, async (req, res) => {
  try {
    let posts = getCached('posts');
    if (!posts) {
      posts = await Post.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean();
      setCached('posts', posts);
    }
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json({ data: posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/ads', adsListLimiter, async (req, res) => {
  try {
    let ads = getCached('ads');
    if (!ads) {
      const Ad = require('./models/Ad');
      ads = await Ad.find({}).lean();
      setCached('ads', ads);
    }
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ─────────────────────────────────────────────────────────────────

app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/weekly-papers', require('./routes/weeklyPapers'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/board-listings', require('./routes/boardListings'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/stats', require('./routes/stats'));

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

const coerceDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const backfillLegacyPostPublishedAt = async () => {
  const cursor = Post.collection.find(
    {},
    { projection: { _id: 1, publishedAt: 1, createdAt: 1, date: 1 } }
  );
  const operations = [];
  let skipped = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) break;

    const currentPublishedAt = coerceDate(doc.publishedAt);
    if (currentPublishedAt) continue;

    const createdAtFallback = coerceDate(doc.createdAt);
    const legacyDateFallback = coerceDate(doc.date);
    const nextPublishedAt = createdAtFallback || legacyDateFallback;
    if (!nextPublishedAt) {
      skipped += 1;
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { publishedAt: nextPublishedAt } },
      },
    });
  }

  if (operations.length > 0) {
    await Post.bulkWrite(operations, { ordered: false });
  }

  console.log(`🛠️ Post publishedAt backfill complete: updated=${operations.length} skipped=${skipped}`);
};

const resolvePostPrimaryImage = (post) => {
  const directImage = `${post?.imageUrl || ''}`.trim();
  if (directImage) return directImage;
  if (Array.isArray(post?.images)) {
    const firstImage = post.images.find((image) => `${image?.url || ''}`.trim());
    if (firstImage?.url) return firstImage.url.trim();
  }
  return '';
};

app.get('/p/:shortCode', shortLinkLimiter, async (req, res) => {
  try {
    const rawCode = `${req.params.shortCode || ''}`.trim();
    const requestedCode = normalizeShortCode(req.params.shortCode);
    if (!rawCode) return sendShareErrorPage(res, 404, 'הקישור לכתבה לא נמצא. מעבירים אתכם לעמוד הבית.');

    let post = requestedCode ? await Post.findOne({ shortLinkCode: requestedCode }).lean() : null;
    if (!post && requestedCode) {
      const candidates = await Post.find({ shortLinkCode: { $exists: true, $ne: '' } })
        .select('title excerpt imageUrl images shortLinkCode createdAt')
        .lean();
      post = candidates.find(candidate => normalizeShortCode(candidate.shortLinkCode, candidate._id?.toString()) === requestedCode);
    }
    if (!post && mongoose.Types.ObjectId.isValid(rawCode)) {
      post = await Post.findById(rawCode).lean();
    }

    if (!post) return sendShareErrorPage(res, 404, 'הקישור לכתבה לא נמצא. מעבירים אתכם לעמוד הבית.');

    const title = post.title || 'צפת בתנופה';
    const description = post.excerpt || 'כתבה מתוך אתר צפת בתנופה';
    const image = resolveShareImage({
      rawImage: resolvePostPrimaryImage(post),
      postId: post._id,
      fallbackImage: `${publicSiteUrl}/og-whatsapp.png`,
    });
    const imageType = resolveShareImageType({
      rawImage: resolvePostPrimaryImage(post),
      fallbackImage: `${publicSiteUrl}/og-whatsapp.png`,
    });
    const articleUrl = `${publicSiteUrl}/#/article/${post._id}`;
    const shortUrl = `${publicSiteUrl}/p/${requestedCode || rawCode}`;
    sendShareRedirectPage({ res, title, description, image, imageType, pageUrl: shortUrl, redirectUrl: articleUrl });
  } catch (err) {
    sendShareErrorPage(res, 500, 'אירעה שגיאה בפתיחת הקישור. מעבירים אתכם לעמוד הבית.');
  }
});

app.get('/share/article/:id', spaFallbackLimiter, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendShareErrorPage(res, 404, 'הכתבה לא נמצאה. מעבירים אתכם לעמוד הבית.');
    }
    const post = await Post.findById(req.params.id).lean();
    if (!post) return sendShareErrorPage(res, 404, 'הכתבה לא נמצאה. מעבירים אתכם לעמוד הבית.');

    const title = post.title || 'צפת בתנופה';
    const description = post.excerpt || 'כתבה מתוך אתר צפת בתנופה';
    const image = resolveShareImage({
      rawImage: resolvePostPrimaryImage(post),
      postId: post._id,
      fallbackImage: `${publicSiteUrl}/og-whatsapp.png`,
    });
    const imageType = resolveShareImageType({
      rawImage: resolvePostPrimaryImage(post),
      fallbackImage: `${publicSiteUrl}/og-whatsapp.png`,
    });
    const articleUrl = `${publicSiteUrl}/#/article/${post._id}`;
    const shareUrl = `${publicSiteUrl}/share/article/${post._id}`;

    sendShareRedirectPage({ res, title, description, image, imageType, pageUrl: shareUrl, redirectUrl: articleUrl });
  } catch (err) {
    sendShareErrorPage(res, 500, 'אירעה שגיאה בטעינת הכתבה. מעבירים אתכם לעמוד הבית.');
  }
});

app.get('/api/posts/:id/og-image', spaFallbackLimiter, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('imageUrl images').lean();
    const imageUrl = resolvePostPrimaryImage(post);
    if (!post || !imageUrl) return res.status(404).end();

    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (!matches) return res.status(404).end();
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    return res.redirect(302, imageUrl);
  } catch (err) {
    res.status(500).end();
  }
});

app.use(express.static(distDir, {
  index: false,
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
      return;
    }
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));

app.get('*', spaFallbackLimiter, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (!hasDistIndex) {
    return res.status(503).json({ message: 'Frontend build not available yet' });
  }
  res.setHeader('Cache-Control', 'no-cache');
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

if (!JWT_SECRET) {
  console.error('❌ Startup error: JWT_SECRET is missing');
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

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => ensureDefaultAdmin())
  .then(() => backfillLegacyPostPublishedAt())
  .then(() => warmCache())
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Static frontend path: ${distDir}`);
      console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
    });
    server.on('error', (error) => {
      console.error('❌ Startup server error:', error);
      process.exit(1);
    });

    // Auto-unfeature posts that have been in the slider for more than 24 hours
    const UNFEATURE_INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes
    const FEATURED_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
    const autoUnfeatureJob = setInterval(async () => {
      try {
        if (mongoose.connection.readyState !== 1) {
          console.warn('⚠️ Auto-unfeature: skipping – MongoDB not connected (readyState:', mongoose.connection.readyState, ')');
          return;
        }
        const cutoff = new Date(Date.now() - FEATURED_MAX_AGE_MS);
        const result = await Post.updateMany(
          { isFeatured: true, featuredAt: { $lte: cutoff } },
          { $set: { isFeatured: false, featuredAt: null } }
        );
        if (result.modifiedCount > 0) {
          console.log(`🕐 Auto-unfeature: ${result.modifiedCount} post(s) removed from main slider after 24h`);
        }
      } catch (err) {
        console.error('❌ Auto-unfeature job error:', err);
      }
    }, UNFEATURE_INTERVAL_MS);
    autoUnfeatureJob.unref();
  })
  .catch(err => {
    console.error('❌ Startup error:', err);
    process.exit(1);
  });
