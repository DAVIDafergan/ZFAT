# צפת בתנופה — הוראות הפעלה

אתר חדשות מקומי לצפת והגליל. בנוי עם React 19 + TypeScript + Vite בחזית, ו-Node.js + Express + MongoDB בשרת.

## מה חדש במערכת

- חיבור מלא ל-MongoDB עם תמיכה ב-`MONGO_URL` ל-Railway
- העלאת קבצי ניהול (תמונות / PDF / וידאו) ישירות ל-AWS S3 דרך `/api/uploads`
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
MONGO_URL=<railway mongo url>
JWT_SECRET=change_me
FRONTEND_URL=https://zfatbitnufa.com
PUBLIC_SITE_URL=https://zfatbitnufa.com
CORS_ALLOWED_ORIGINS=https://www.zfatbitnufa.com
AWS_S3_REGION=eu-north-1
AWS_S3_BUCKET=<your bucket>
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret key>
AWS_S3_PUBLIC_BASE_URL=https://<your bucket>.s3.eu-north-1.amazonaws.com
AWS_S3_UPLOAD_PREFIX=uploads
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

Frontend: [https://zfatbitnufa.com](https://zfatbitnufa.com)

Backend healthcheck: [https://zfatbitnufa.com/health](https://zfatbitnufa.com/health)

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

### Single Railway Service (Node + Express + Vite build)

ב-Railway יש לפרוס את המאגר מה-root ולהגדיר:

- **Build Command:** `npm run build`
- **Start Command:** `node server/index.js` (או `npm start`)
- **Port:** השרת מאזין ל-`process.env.PORT`

בפרודקשן מומלץ להגדיר:

```env
MONGO_URL=<railway mongo url>
JWT_SECRET=<strong secret>
FRONTEND_URL=https://zfatbitnufa.com
PUBLIC_SITE_URL=https://zfatbitnufa.com
CORS_ALLOWED_ORIGINS=https://www.zfatbitnufa.com
AWS_S3_REGION=eu-north-1
AWS_S3_BUCKET=<your bucket>
AWS_ACCESS_KEY_ID=<access key>
AWS_SECRET_ACCESS_KEY=<secret key>
AWS_S3_PUBLIC_BASE_URL=https://<your bucket>.s3.eu-north-1.amazonaws.com
AWS_S3_UPLOAD_PREFIX=uploads
```

ה-Backend מחזיר תגובות JSON למסלולי ה-API ולמסלולי הבדיקה:

- `GET /`
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`

אותו שירות גם משרת את build ה-frontend מהתיקייה `dist` עם SPA fallback כך שרענון נתיבים עובד.

### Frontend environment

אם צריך להגדיר URL מפורש ב-frontend:

```env
VITE_API_URL=https://<your-backend-domain>
VITE_PUBLIC_SITE_URL=https://zfatbitnufa.com
```

אם ה-frontend וה-backend רצים על דומיינים שונים, `VITE_API_URL` חייב להצביע על כתובת השרת המלאה (למשל Railway), ולא על דומיין הסטטיק.

Build ידני מה-root:

```bash
npm run build
```
