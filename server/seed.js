require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Ad = require('./models/Ad');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zfat.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@SecurePass123!';

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
    shortLinkCode: 'zfbt001'
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
    shortLinkCode: 'zfbt002'
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
    shortLinkCode: 'zfbt003'
  },
  {
    title: 'הורים מודאגים: תלמידי בית ספר "הגליל" ילמדו בגן אירועים בשל בעיות מבניות',
    excerpt: 'לאחר שהתגלו סדקים בקירות, הוחלט להעביר את תלמידי בית הספר לאולם אירועים סמוך.',
    content: '<p>הורי תלמידי בית ספר "הגליל" בצפת הובאו לידיעה שבניית בית הספר הוכרזה כלא בטוחה לאחר שהתגלו סדקים בקירות.</p>',
    category: 'קהילה וחברה',
    author: 'מרים לוי',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
    tags: ['חינוך', 'צפת', 'קהילה'],
    isFeatured: false,
    views: 890,
    shortLinkCode: 'zfbt004'
  },
  {
    title: 'גל חום חריג צפוי בגליל: טמפרטורות של עד 42 מעלות',
    excerpt: 'שירות המטאורולוגי מתריע על גל חום חריג שצפוי להכות באזור הגליל בימים הקרובים.',
    content: '<p>שירות המטאורולוגי הישראלי הוציא התראת מזג אוויר חמור עם צפי לגל חום שיכה באזור הגליל בימים הקרובים.</p>',
    category: 'מזג אוויר',
    author: 'דב שמעון',
    imageUrl: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=800',
    tags: ['מזג אוויר', 'גל חום', 'גליל'],
    isFeatured: false,
    views: 3200,
    shortLinkCode: 'zfbt005'
  }
];

const sampleAds = [
  {
    title: 'לוח ראשי',
    area: 'leaderboard',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/970x90/2563EB/FFFFFF?text=פרסומת+ראשית', linkUrl: '#' }]
  },
  {
    title: 'סרגל צדדי',
    area: 'sidebar',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/300x250/1A1A2E/FFFFFF?text=פרסומת+צד', linkUrl: '#' }]
  },
  {
    title: 'אמצע עמוד בית',
    area: 'homepage_mid',
    isActive: true,
    slides: [{ imageUrl: 'https://via.placeholder.com/728x90/DC2626/FFFFFF?text=מודעת+אמצע+עמוד', linkUrl: '#' }]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zfat-news');
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({ name: 'מנהל ראשי', email: ADMIN_EMAIL, password: hashed, role: 'admin' });
      console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      await Post.insertMany(samplePosts);
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

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
