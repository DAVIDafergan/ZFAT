# צפת בתנופה — הוראות הפעלה

אתר חדשות מקומי לצפת והגליל. בנוי עם React 19 + TypeScript + Vite בחזית, ו-Node.js + Express + MongoDB בשרת.

## מה חדש במערכת

- חיבור מלא ל-MongoDB עם תמיכה ב-`MONGO_URL` ל-Railway
- עמוד **העיתון השבועי** עם העלאת PDF מהניהול, חיפוש לפי שבוע, קריאה אונליין והורדה
- עמוד **לוח בתנופה** למודעות דירות להשכרה ולמכירה בצפת, כולל מעבר ישיר לוואטסאפ עם הודעה מוכנה
- קישורי שיתוף קצרים וממוספרים לכתבות עם תצוגת Open Graph במסלול `/p/:shortCode`
- שדרוג טיפוגרפיה, מיתוג, לוגו ונגישות כללית

## דרישות מקדימות

- Node.js 18+
- MongoDB מקומי או חיבור ענן (למשל Railway / Atlas)

## התקנה

### 1. Frontend

```bash
npm install
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# ערוך את server/.env עם הפרמטרים שלך
```

## הפעלת הפרויקט

### שלב 1: הגדר MongoDB

בקובץ `server/.env`:

```env
MONGO_URL=mongodb://localhost:27017/zfat-news
JWT_SECRET=change_me
FRONTEND_URL=http://localhost:5173
PUBLIC_SITE_URL=http://localhost:5173
```

> השרת תומך גם ב-`MONGODB_URI`, אבל `MONGO_URL` הוא המשתנה המומלץ לפרודקשן ב-Railway.

### שלב 2: Seed נתונים ראשוניים

```bash
cd server
npm run seed
```

### שלב 3: הפעל שרת Backend

```bash
cd server
npm run dev
```

### שלב 4: הפעל Frontend (בחלון נפרד)

```bash
# מהתיקיית השורש
npm run dev
```

### שלב 5: גש לאתר

Frontend: [http://localhost:5173](http://localhost:5173)

Backend healthcheck: [http://localhost:3001/health](http://localhost:3001/health)

## כניסת אדמין

Email ו-password מוגדרים בקובץ `server/.env` תחת `ADMIN_EMAIL` ו-`ADMIN_PASSWORD`.

ברירת מחדל (לסביבת פיתוח בלבד):
- Email: `admin@zfat.com`
- Password: `Admin@SecurePass123!`

**שנה את הסיסמה לפני העלאה לפרודקשן!**

## מבנה הפרויקט

```text
ZFAT/
├── server/                 # Backend Node.js + Express + Mongoose
│   ├── models/             # Post / Ad / WeeklyPaper / BoardListing / ...
│   ├── routes/             # REST API + /p/:shortCode preview route
│   ├── middleware/         # Auth + admin middleware
│   ├── utils/              # Helper utilities for short links / HTML escaping
│   └── seed.js             # Script לאתחול נתונים
├── components/             # רכיבי React
├── pages/                  # עמודי האתר והניהול
├── services/               # API layer + site configuration
├── context/                # React context
├── index.css               # טיפוגרפיה, מיתוג ונגישות
├── types.ts                # TypeScript types
└── App.tsx                 # Main app shell + routes
```

## פריסה ל-Railway

בפרודקשן מומלץ להגדיר:

```env
MONGO_URL=<railway mongo url>
FRONTEND_URL=<frontend origin>
PUBLIC_SITE_URL=<public site/backend origin used for share previews>
```

אם החזית מדברת לשרת דרך כתובת שונה, אפשר להגדיר גם ב-frontend:

```env
VITE_API_URL=<backend url>
VITE_PUBLIC_SITE_URL=<public url for /p/:shortCode shares>
```
