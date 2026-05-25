require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Ad = require('./models/Ad');
const WeeklyPaper = require('./models/WeeklyPaper');
const BoardListing = require('./models/BoardListing');
const { generateShortCode } = require('./utils/shortLink');

const ADMIN_NAME = process.env.ADMIN_NAME || 'ניהול';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ZP@GMAIL.COM';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234567';
const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI;

const samplePosts = [
  {
    title: 'פרויקט פיתוח ענק בצפת: 500 יחידות דיור חדשות יוקמו בשכונה הצפונית',
    excerpt: 'עיריית צפת אישרה פרויקט בנייה שיכלול 500 יחידות דיור, שטחי מסחר ופארק ציבורי גדול.',
    content: '<p>עיריית צפת אישרה פרויקט בנייה שיכלול 500 יחידות דיור חדשות. הפרויקט צפוי להתחיל בתחילת השנה הבאה.</p><p>ראש העיר ציין כי הפרויקט יסייע לפתרון מצוקת הדיור באזור.</p>',
    category: 'מבזקים',
    author: 'מערכת צפת בתנופה',
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    tags: ['נדלן', 'צפת', 'בנייה'],
    isFeatured: true,
    views: 1250,
    shortLinkCode: '100001'
  },
  {
    title: 'פסטיבל הכליזמר השנתי: 50,000 מבקרים צפויים בצפת החודש',
    excerpt: 'פסטיבל הכליזמר המסורתי של צפת יתקיים החודש עם מעל 100 הופעות בכל רחבי העיר.',
    content: '<p>פסטיבל הכליזמר השנתי חוזר לצפת עם תוכנית עשירה ומגוונת. השנה יוצגו מעל 100 הופעות במשך ארבעה ימים.</p>',
    category: 'תרבות ואומנות',
    author: 'רחל כהן',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    tags: ['פסטיבל', 'כליזמר', 'תרבות', 'צפת'],
    isFeatured: true,
    views: 2100,
    shortLinkCode: '100002'
  },
  {
    title: 'כוחות הביטחון סיכלו ניסיון פגיעה בכביש 90 — שני מחבלים נוטרלו',
    excerpt: 'כוחות צה"ל ומשטרת ישראל פעלו בשיתוף פעולה לסיכול פיגוע ירי לכיוון כלי רכב אזרחיים.',
    content: '<p>בשעות הלילה פעלו כוחות צה"ל ומשטרת ישראל לסיכול ניסיון פגיעה בכביש 90. שני מחבלים נוטרלו במהלך המבצע.</p>',
    category: 'ביטחון',
    author: 'כתב הביטחון',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
    tags: ['ביטחון', 'גליל', 'צה"ל'],
    isFeatured: false,
    views: 4500,
    shortLinkCode: '100003'
  }
];

const sampleAds = [
  {
    title: 'באנר עליון ראשי',
    area: 'leaderboard',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x250/2563EB/FFFFFF?text=פרסומת+ראשית', linkUrl: '#' }]
  },
  {
    title: 'באנר מרכזי בית',
    area: 'homepage_mid',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x300/DC2626/FFFFFF?text=מודעת+אמצע+עמוד', linkUrl: '#' }]
  },
  {
    title: 'באנר תחתית פיד הבית',
    area: 'homepage_feed',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x220/991B1B/FFFFFF?text=באנר+פיד+הבית', linkUrl: '#' }]
  },
  {
    title: 'סרגל צדדי',
    area: 'sidebar',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/360x600/1A1A2E/FFFFFF?text=פרסומת+צד', linkUrl: '#' }]
  },
  {
    title: 'וידאו צדדי',
    area: 'sidebar_video',
    isActive: true,
    slides: [{
      imageUrl: 'https://via.placeholder.com/360x640/374151/FFFFFF?text=וידאו+צדדי',
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      linkUrl: '#'
    }]
  },
  {
    title: 'באנר בתוך כתבה',
    area: 'article_inline',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x250/047857/FFFFFF?text=פרסום+בתוך+כתבה', linkUrl: '#' }]
  },
  {
    title: 'באנר תחתון כתבה',
    area: 'article_bottom',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x300/1D4ED8/FFFFFF?text=פרסום+תחתון+כתבה', linkUrl: '#' }]
  },
  {
    title: 'באנר עליון קטגוריה',
    area: 'category_top',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x220/7C3AED/FFFFFF?text=פרסום+קטגוריה+עליון', linkUrl: '#' }]
  },
  {
    title: 'באנר אמצע קטגוריה',
    area: 'category_mid',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x220/BE123C/FFFFFF?text=פרסום+קטגוריה+אמצע', linkUrl: '#' }]
  },
  {
    title: 'באנר עיתון שבועי',
    area: 'weekly_top',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x240/111827/FFFFFF?text=פרסום+עיתון+שבועי', linkUrl: '#' }]
  },
  {
    title: 'באנר לוח בתנופה',
    area: 'board_top',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x240/9A3412/FFFFFF?text=פרסום+לוח+בתנופה', linkUrl: '#' }]
  },
  {
    title: 'באנר צור קשר',
    area: 'contact_top',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x220/0E7490/FFFFFF?text=פרסום+צור+קשר', linkUrl: '#' }]
  },
  {
    title: 'באנר תוצאות חיפוש',
    area: 'search_top',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/1200x220/334155/FFFFFF?text=פרסום+תוצאות+חיפוש', linkUrl: '#' }]
  },
];

const sampleWeeklyPapers = [
  {
    title: 'העיתון השבועי - מהדורת סוף השבוע',
    weekKey: '2026-W21',
    description: 'מהדורה מלאה עם כותרות השבוע, טורי דעה וכתבות נדל"ן.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
    publishedAt: new Date(),
    isActive: true,
  }
];

const sampleBoardListings = [
  {
    title: 'דירת 4 חדרים להשכרה בשכונת כנען',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
    location: 'שכונת כנען, צפת',
    dealType: 'rent',
    price: 4300,
    sizeSqm: 98,
    details: 'קומה גבוהה, נוף פתוח, חניה צמודה ומיזוג מלא.',
    hasBalcony: true,
    contactName: 'יועץ נדל"ן הגליל',
    contactPhone: '0509553090',
    isActive: true,
  }
];

async function seed() {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URL/MONGODB_URI is not configured');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const normalizedAdminEmail = ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email: normalizedAdminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({ name: ADMIN_NAME, email: normalizedAdminEmail, password: hashed, role: 'admin' });
      console.log(`✅ Admin user created: ${normalizedAdminEmail}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      await Post.insertMany(samplePosts.map(post => ({ ...post, shortLinkCode: post.shortLinkCode || generateShortCode() })));
      console.log(`✅ ${samplePosts.length} sample posts created`);
    } else {
      console.log(`ℹ️  Posts already exist (${postCount})`);
    }

    const adCount = await Ad.countDocuments();
    if (adCount === 0) {
      await Ad.insertMany(sampleAds);
      console.log(`✅ ${sampleAds.length} sample ads created`);
    } else {
      console.log(`ℹ️  Ads already exist (${adCount})`);
    }

    const paperCount = await WeeklyPaper.countDocuments();
    if (paperCount === 0) {
      await WeeklyPaper.insertMany(sampleWeeklyPapers);
      console.log(`✅ ${sampleWeeklyPapers.length} weekly papers created`);
    }

    const listingCount = await BoardListing.countDocuments();
    if (listingCount === 0) {
      await BoardListing.insertMany(sampleBoardListings);
      console.log(`✅ ${sampleBoardListings.length} board listings created`);
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
