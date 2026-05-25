# צפת בתנופה — הוראות הפעלה

אתר חדשות מקומי לצפת והגליל. בנוי עם React 19 + TypeScript + Vite בחזית, ו-Node.js + Express + MongoDB בשרת.

## דרישות מקדימות

- Node.js 18+
- MongoDB מותקן ורץ מקומית (או MongoDB Atlas URI)

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

### שלב 1: הפעל MongoDB

```bash
mongod
```

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

פתח: [http://localhost:5173](http://localhost:5173)

## כניסת אדמין

Email ו-password מוגדרים בקובץ `server/.env` תחת `ADMIN_EMAIL` ו-`ADMIN_PASSWORD`.

ברירת מחדל (לסביבת פיתוח בלבד):
- Email: `admin@zfat.com`
- Password: `Admin@SecurePass123!`

**שנה את הסיסמה לפני העלאה לפרודקשן!**

## מבנה הפרויקט

```
zfat-project/
├── server/              # Backend Node.js + Express + Mongoose
│   ├── index.js         # Entry point
│   ├── .env.example     # דוגמה לקובץ הגדרות
│   ├── seed.js          # Script לאתחול נתונים
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   └── middleware/      # Auth + admin middleware
├── components/          # React components
├── pages/               # React pages
├── services/            # API layer
├── context/             # React context
├── types.ts             # TypeScript types
├── App.tsx              # Main app component
├── index.html           # HTML entry point
└── package.json         # Frontend dependencies
```

## MongoDB Atlas (Cloud)

לשימוש ב-MongoDB Atlas, עדכן את `MONGODB_URI` ב-`server/.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zfat-news
```
