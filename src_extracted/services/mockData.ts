import { Post, Category, Ad, Comment, User, ContactMessage, NewsletterSubscriber } from '../types';

export const INITIAL_POSTS: Post[] = [
  // Weather
  {
    id: '1',
    title: 'שלג ראשון בצפת: העירייה נערכת לחסימת צירים',
    excerpt: 'המערכת החורפית מגיעה לשיאה הלילה. מפלסות השלג כבר בכוננות, והלימודים מחר יתחילו בשעה 10:00.',
    content: `<p>העיר צפת מתכסה בלבן? על פי התחזית העדכנית, צפוי שלג קל החל משעות הערב.</p>`,
    category: Category.WEATHER,
    author: 'מערכת צפת בתנופה',
    date: '2023-10-24',
    imageUrl: 'https://picsum.photos/id/606/800/600',
    tags: ['שלג', 'חורף', 'עירייה'],
    isFeatured: true,
    views: 1250,
    shortLinkCode: '000101'
  },
  {
    id: 'w2',
    title: 'תחזית שבועית: התחממות קלה לקראת הסופ"ש',
    excerpt: 'אחרי הסערה הגדולה, השמש חוזרת. כל הפרטים על מזג האוויר בימים הקרובים.',
    content: '<p>הטמפרטורות יעלו במקצת...</p>',
    category: Category.WEATHER,
    author: 'דני רופ',
    date: '2023-10-25',
    imageUrl: 'https://picsum.photos/id/10/800/600',
    tags: ['שמש', 'תחזית'],
    isFeatured: false,
    views: 400,
    shortLinkCode: '000109'
  },
  {
    id: 'w3',
    title: 'הכנרת עולה: 2 ס"מ נוספו הלילה',
    excerpt: 'הגשמים העזים בצפון נותנים אותותיהם במפלס האגם הלאומי.',
    content: '<p>חדשות טובות למשק המים...</p>',
    category: Category.WEATHER,
    author: 'כתבנו בצפון',
    date: '2023-10-23',
    imageUrl: 'https://picsum.photos/id/1043/800/600',
    tags: ['כנרת', 'מים'],
    isFeatured: false,
    views: 600,
    shortLinkCode: '000110'
  },
  {
    id: 'w4',
    title: 'ערפל כבד שורר בהרי הגליל',
    excerpt: 'הראות לקויה, הנהגים מתבקשים לנסוע בזהירות ולהדליק אורות.',
    content: '<p>זהירות בדרכים...</p>',
    category: Category.WEATHER,
    author: 'מערכת התנועה',
    date: '2023-10-22',
    imageUrl: 'https://picsum.photos/id/1036/800/600',
    tags: ['ערפל', 'זהירות'],
    isFeatured: false,
    views: 300,
    shortLinkCode: '000111'
  },
  {
    id: 'w5',
    title: 'סיכום משקעים: צפת מובילה בכמות הגשם',
    excerpt: 'שיאניות הגשם של המערכת האחרונה נחשפות. צפת בראש הטבלה.',
    content: '<p>נתונים מרשימים...</p>',
    category: Category.WEATHER,
    author: 'מטאורולוגיה',
    date: '2023-10-21',
    imageUrl: 'https://picsum.photos/id/1015/800/600',
    tags: ['גשם', 'סטטיסטיקה'],
    isFeatured: false,
    views: 550,
    shortLinkCode: '000112'
  },

  // Culture
  {
    id: '2',
    title: 'פסטיבל הכלייזמרים חוזר: עשרות אלפי מבקרים צפויים',
    excerpt: 'הפסטיבל הבינלאומי חוזר לסמטאות העיר העתיקה עם מיטב האמנים מהארץ ומהעולם.',
    content: `<p>המסורת נמשכת. פסטיבל הכלייזמרים...</p>`,
    category: Category.CULTURE,
    author: 'דנה כהן',
    date: '2023-10-23',
    imageUrl: 'https://picsum.photos/id/452/800/600',
    tags: ['תרבות', 'פסטיבל'],
    isFeatured: true,
    views: 980,
    shortLinkCode: '000102'
  },
  {
    id: 'c2',
    title: 'תערוכה חדשה במוזיאון המאירי',
    excerpt: 'היסטוריה של צפת דרך עדשת המצלמה. תערוכה מרתקת נפתחה הבוקר.',
    content: '<p>הציבור מוזמן...</p>',
    category: Category.CULTURE,
    author: 'כתב תרבות',
    date: '2023-10-20',
    imageUrl: 'https://picsum.photos/id/20/800/600',
    tags: ['מוזיאון', 'היסטוריה'],
    isFeatured: false,
    views: 200,
    shortLinkCode: '000113'
  },
  {
    id: 'c3',
    title: 'הופעה של אביתר בנאי במשכן לאומנויות',
    excerpt: 'כל הכרטיסים אזלו תוך שעה. צפת מתכוננת לערב בלתי נשכח.',
    content: '<p>התרגשות בעיר...</p>',
    category: Category.CULTURE,
    author: 'מערכת תרבות',
    date: '2023-10-18',
    imageUrl: 'https://picsum.photos/id/30/800/600',
    tags: ['מוזיקה', 'הופעה'],
    isFeatured: false,
    views: 1200,
    shortLinkCode: '000114'
  },
  {
    id: 'c4',
    title: 'סדנאות יצירה לילדים בחופשת החנוכה',
    excerpt: 'המתנ"ס העירוני מציע מגוון פעילויות לכל המשפחה במחירים מסובסדים.',
    content: '<p>פרטים נוספים באתר העירייה...</p>',
    category: Category.CULTURE,
    author: 'קהילה',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/id/40/800/600',
    tags: ['ילדים', 'חופש'],
    isFeatured: false,
    views: 350,
    shortLinkCode: '000115'
  },
  {
    id: 'c5',
    title: 'סיורי עששיות בסמטאות העתיקות',
    excerpt: 'אטרקציה לילית קסומה כובשת את התיירים בעיר העתיקה.',
    content: '<p>חוויה מיוחדת במינה...</p>',
    category: Category.CULTURE,
    author: 'תיירות צפת',
    date: '2023-10-12',
    imageUrl: 'https://picsum.photos/id/50/800/600',
    tags: ['תיירות', 'לילה'],
    isFeatured: false,
    views: 890,
    shortLinkCode: '000116'
  },

  // Politics
  {
    id: '5',
    title: 'בחירות מקומיות: סקירת המועמדים המובילים',
    excerpt: 'חודש לבחירות, והמרוץ לראשות העיר מתחמם. פאנל מיוחד.',
    content: `<p>מערכת הבחירות נכנסת לישורת האחרונה...</p>`,
    category: Category.POLITICS,
    author: 'פוליטי מדיני',
    date: '2023-10-20',
    imageUrl: 'https://picsum.photos/id/403/800/600',
    tags: ['בחירות', 'פוליטיקה'],
    isFeatured: true,
    views: 3200,
    shortLinkCode: '000105'
  },
  {
    id: 'p2',
    title: 'ישיבת מועצה סוערת: אושר התקציב השנתי',
    excerpt: 'לאחר דיון של 6 שעות, חברי המועצה הצביעו בעד התקציב החדש.',
    content: '<p>האופוזיציה התנגדה...</p>',
    category: Category.POLITICS,
    author: 'כתב מקומי',
    date: '2023-10-25',
    imageUrl: 'https://picsum.photos/id/60/800/600',
    tags: ['מועצה', 'תקציב'],
    isFeatured: false,
    views: 500,
    shortLinkCode: '000117'
  },
  {
    id: 'p3',
    title: 'ראיון בלעדי עם ראש העיר',
    excerpt: '"השנה הקרובה תהיה שנת המפנה של צפת".',
    content: '<p>בראיון חג מיוחד...</p>',
    category: Category.POLITICS,
    author: 'עורך ראשי',
    date: '2023-10-10',
    imageUrl: 'https://picsum.photos/id/70/800/600',
    tags: ['ראיון', 'ראש העיר'],
    isFeatured: true,
    views: 2200,
    shortLinkCode: '000118'
  },
  {
    id: 'p4',
    title: 'שר הפנים ביקר בצפת והבטיח סיוע',
    excerpt: 'במהלך הסיור הבטיח השר תקציבים לפיתוח שכונות חדשות.',
    content: '<p>הביקור המוצלח...</p>',
    category: Category.POLITICS,
    author: 'כתב מדיני',
    date: '2023-10-05',
    imageUrl: 'https://picsum.photos/id/80/800/600',
    tags: ['ממשלה', 'פיתוח'],
    isFeatured: false,
    views: 750,
    shortLinkCode: '000119'
  },
  {
    id: 'p5',
    title: 'הקואליציה העירונית מתרחבת',
    excerpt: 'מפלגה נוספת הצטרפה הבוקר לקואליציה של ראש העיר.',
    content: '<p>שינויים במפה הפוליטית...</p>',
    category: Category.POLITICS,
    author: 'פרשן פוליטי',
    date: '2023-10-01',
    imageUrl: 'https://picsum.photos/id/90/800/600',
    tags: ['קואליציה', 'פוליטיקה'],
    isFeatured: false,
    views: 400,
    shortLinkCode: '000120'
  },

  // Infrastructure
  {
    id: '3',
    title: 'אושרה תוכנית המתאר החדשה לשכונת דרום',
    excerpt: '500 יחידות דיור חדשות, פארק רחב ידיים ומרכז מסחרי.',
    content: `<p>בשורה לזוגות הצעירים...</p>`,
    category: Category.INFRASTRUCTURE,
    author: 'יוסי לוי',
    date: '2023-10-22',
    imageUrl: 'https://picsum.photos/id/122/800/600',
    tags: ['נדלן', 'בניה'],
    isFeatured: false,
    views: 450,
    shortLinkCode: '000103'
  },
  {
    id: 'i2',
    title: 'שיפוצים בכניסה לעיר: צפי לפקקים',
    excerpt: 'העבודות להרחבת הכביש הראשי מתחילות מחר. סעו בדרכים חלופיות.',
    content: '<p>סבלנות, משפרים את הדרך...</p>',
    category: Category.INFRASTRUCTURE,
    author: 'תחבורה צפון',
    date: '2023-10-24',
    imageUrl: 'https://picsum.photos/id/130/800/600',
    tags: ['כבישים', 'תחבורה'],
    isFeatured: false,
    views: 1100,
    shortLinkCode: '000121'
  },
  {
    id: 'i3',
    title: 'פארק משחקים חדש נחנך בשכונת רמת רזים',
    excerpt: 'מתקנים חדישים, דשא סינטטי והצללה לרווחת התושבים.',
    content: '<p>ילדי השכונה מרוצים...</p>',
    category: Category.INFRASTRUCTURE,
    author: 'כתב מקומי',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/id/140/800/600',
    tags: ['פארק', 'ילדים'],
    isFeatured: false,
    views: 600,
    shortLinkCode: '000122'
  },
  {
    id: 'i4',
    title: 'בעיות לחץ מים ברחבי העיר העתיקה',
    excerpt: 'תושבים מתלוננים על זרם חלש. העירייה: הנושא בטיפול.',
    content: '<p>תשתיות ישנות...</p>',
    category: Category.INFRASTRUCTURE,
    author: 'מוקד עירוני',
    date: '2023-10-10',
    imageUrl: 'https://picsum.photos/id/150/800/600',
    tags: ['מים', 'תקלות'],
    isFeatured: false,
    views: 300,
    shortLinkCode: '000123'
  },
  {
    id: 'i5',
    title: 'תאורה חכמה תותקן בכל רחבי העיר',
    excerpt: 'פרויקט החלפת תאורת הרחוב ל-LED יוצא לדרך. חיסכון משמעותי בחשמל.',
    content: '<p>עיר חכמה...</p>',
    category: Category.INFRASTRUCTURE,
    author: 'איכות הסביבה',
    date: '2023-10-08',
    imageUrl: 'https://picsum.photos/id/160/800/600',
    tags: ['חשמל', 'טכנולוגיה'],
    isFeatured: false,
    views: 500,
    shortLinkCode: '000124'
  },

  // Security
  {
    id: '4',
    title: 'תרגיל חירום רחב היקף בגליל העליון',
    excerpt: 'כוחות הביטחון וההצלה יקיימו מחר תרגיל המדמה נפילת טילים.',
    content: `<p>החל משעות הבוקר יורגש עומס תנועה...</p>`,
    category: Category.SECURITY,
    author: 'כתב צבאי',
    date: '2023-10-24',
    imageUrl: 'https://picsum.photos/id/905/800/600',
    tags: ['ביטחון', 'צהל'],
    isFeatured: false,
    views: 2100,
    shortLinkCode: '000104'
  },
  {
    id: 's2',
    title: 'ביקור הרמטכ"ל בפיקוד צפון',
    excerpt: 'הרמטכ"ל קיים הערכת מצב ושיבח את מוכנות הכוחות בגזרה.',
    content: '<p>מסר של הרתעה...</p>',
    category: Category.SECURITY,
    author: 'דובר צהל',
    date: '2023-10-23',
    imageUrl: 'https://picsum.photos/id/180/800/600',
    tags: ['צבא', 'ביטחון'],
    isFeatured: false,
    views: 1800,
    shortLinkCode: '000125'
  },
  {
    id: 's3',
    title: 'נעצרה חוליית גנבי רכב בצפון',
    excerpt: 'בפעילות משטרתית מהירה נתפסו החשודים "על חם".',
    content: '<p>המאבק בפשיעה...</p>',
    category: Category.SECURITY,
    author: 'משטרת ישראל',
    date: '2023-10-21',
    imageUrl: 'https://picsum.photos/id/190/800/600',
    tags: ['משטרה', 'פלילים'],
    isFeatured: false,
    views: 900,
    shortLinkCode: '000126'
  },
  {
    id: 's4',
    title: 'תרגיל כבאות והצלה בבתי הספר',
    excerpt: 'תלמידי העיר תרגלו ירידה למקלטים וכיבוי שריפות.',
    content: '<p>מוכנות לחירום...</p>',
    category: Category.SECURITY,
    author: 'כיבוי אש',
    date: '2023-10-18',
    imageUrl: 'https://picsum.photos/id/200/800/600',
    tags: ['חינוך', 'בטיחות'],
    isFeatured: false,
    views: 400,
    shortLinkCode: '000127'
  },
  {
    id: 's5',
    title: 'שדרוג המקלטים הציבוריים בעיר',
    excerpt: 'העירייה השקיעה מיליונים בשיפוץ ואבזור המקלטים לשעת חירום.',
    content: '<p>ביטחון התושבים...</p>',
    category: Category.SECURITY,
    author: 'ביטחון עירוני',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/id/210/800/600',
    tags: ['מקלטים', 'חירום'],
    isFeatured: false,
    views: 650,
    shortLinkCode: '000128'
  },
  // Crime
  {
    id: 'cr1',
    title: 'כתב אישום נגד תושב האזור בגין הונאה',
    excerpt: 'החשוד עקץ קשישים באלפי שקלים. הפרקליטות הגישה כתב אישום חמור.',
    content: '<p>הונאה מתוחכמת...</p>',
    category: Category.CRIME,
    author: 'כתב משפט',
    date: '2023-10-25',
    imageUrl: 'https://picsum.photos/id/220/800/600',
    tags: ['משפט', 'הונאה'],
    isFeatured: false,
    views: 1200,
    shortLinkCode: '000129'
  },
  {
    id: 'cr2',
    title: 'פשיטה על מעבדת סמים בדירה שכורה',
    excerpt: 'המשטרה החרימה עשרות שתילים וציוד יקר ערך.',
    content: '<p>במרכז העיר...</p>',
    category: Category.CRIME,
    author: 'פלילים צפון',
    date: '2023-10-22',
    imageUrl: 'https://picsum.photos/id/230/800/600',
    tags: ['סמים', 'משטרה'],
    isFeatured: false,
    views: 800,
    shortLinkCode: '000130'
  },
  {
    id: 'cr3',
    title: 'קטטה המונית במועדון לילה',
    excerpt: 'שלושה פצועים קל פונו לבית החולים זיו. המשטרה חוקרת.',
    content: '<p>אלימות בבילויים...</p>',
    category: Category.CRIME,
    author: 'חדשות הלילה',
    date: '2023-10-20',
    imageUrl: 'https://picsum.photos/id/240/800/600',
    tags: ['אלימות', 'מועדונים'],
    isFeatured: false,
    views: 1500,
    shortLinkCode: '000131'
  },
  {
    id: 'cr4',
    title: 'פריצה לעסק במדרחוב: נגנב ציוד בשווי רב',
    excerpt: 'בעלי העסקים זועמים ודורשים תגבור סיורים משטרתיים.',
    content: '<p>מכת גניבות...</p>',
    category: Category.CRIME,
    author: 'עסקים בצפת',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/id/250/800/600',
    tags: ['גניבה', 'עסקים'],
    isFeatured: false,
    views: 600,
    shortLinkCode: '000132'
  },
  {
    id: 'cr5',
    title: 'גזר דין בפרשת השוחד בעירייה',
    excerpt: 'בית המשפט גזר עבודות שירות על הפקיד הבכיר לשעבר.',
    content: '<p>סוף לפרשה...</p>',
    category: Category.CRIME,
    author: 'כתב בתי משפט',
    date: '2023-10-10',
    imageUrl: 'https://picsum.photos/id/260/800/600',
    tags: ['שחיתות', 'משפט'],
    isFeatured: false,
    views: 2000,
    shortLinkCode: '000133'
  },

  // Community
  {
    id: 'cm1',
    title: 'מתנדבים למען הקשישים בחורף',
    excerpt: 'פרויקט "חמם ליבם" יוצא לדרך. בואו להתנדב ולסייע.',
    content: '<p>ערבות הדדית...</p>',
    category: Category.COMMUNITY,
    author: 'רווחה',
    date: '2023-10-26',
    imageUrl: 'https://picsum.photos/id/270/800/600',
    tags: ['התנדבות', 'רווחה'],
    isFeatured: true,
    views: 450,
    shortLinkCode: '000134'
  },
  {
    id: 'cm2',
    title: 'יום המעשים הטובים בצפת',
    excerpt: 'אלפי תלמידים ותושבים יצאו לרחובות לעשות טוב.',
    content: '<p>העיר נצבעה ורוד...</p>',
    category: Category.COMMUNITY,
    author: 'חינוך חברתי',
    date: '2023-10-24',
    imageUrl: 'https://picsum.photos/id/280/800/600',
    tags: ['קהילה', 'חינוך'],
    isFeatured: false,
    views: 300,
    shortLinkCode: '000135'
  },
  {
    id: 'cm3',
    title: 'הוקמה גינה קהילתית חדשה',
    excerpt: 'תושבי השכונה הקימו יחד גינת ירק וצמחי תבלין.',
    content: '<p>ירוק בעיניים...</p>',
    category: Category.COMMUNITY,
    author: 'איכות הסביבה',
    date: '2023-10-20',
    imageUrl: 'https://picsum.photos/id/290/800/600',
    tags: ['גינה', 'קהילה'],
    isFeatured: false,
    views: 250,
    shortLinkCode: '000136'
  },
  {
    id: 'cm4',
    title: 'טקס מצטייני ראש העיר בחינוך',
    excerpt: 'מורים ותלמידים מצטיינים קיבלו תעודות הוקרה.',
    content: '<p>גאווה עירונית...</p>',
    category: Category.COMMUNITY,
    author: 'דוברות',
    date: '2023-10-15',
    imageUrl: 'https://picsum.photos/id/300/800/600',
    tags: ['חינוך', 'הצטיינות'],
    isFeatured: false,
    views: 400,
    shortLinkCode: '000137'
  },
  {
    id: 'cm5',
    title: 'שוק קח-תן קהילתי',
    excerpt: 'הצלחה מסחררת ליריד החלפות יד שנייה במתנ"ס.',
    content: '<p>קיימות וקהילה...</p>',
    category: Category.COMMUNITY,
    author: 'קהילה ירוקה',
    date: '2023-10-10',
    imageUrl: 'https://picsum.photos/id/310/800/600',
    tags: ['יד שניה', 'סביבה'],
    isFeatured: false,
    views: 150,
    shortLinkCode: '000138'
  }
];

export const INITIAL_ADS: Ad[] = [
  {
    id: 'ad1',
    title: 'מבצע רכב',
    area: 'sidebar',
    isActive: true,
    slides: [
      {
        id: 's1',
        imageUrl: 'https://picsum.photos/id/111/300/250',
        linkUrl: '#'
      }
    ]
  },
  {
    id: 'ad_video',
    title: 'פרסומת וידאו',
    area: 'sidebar_video',
    isActive: true,
    slides: [
      {
        id: 'sv1',
        imageUrl: 'https://picsum.photos/id/444/300/250', // Fallback
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        linkUrl: '#'
      }
    ]
  },
  {
    id: 'ad2',
    title: 'נדלן צפת',
    area: 'leaderboard',
    isActive: true,
    slides: [
      {
        id: 's2',
        imageUrl: 'https://picsum.photos/id/222/1200/200',
        linkUrl: '#'
      },
      {
        id: 's3',
        imageUrl: 'https://picsum.photos/id/234/1200/200',
        linkUrl: '#'
      }
    ]
  },
  {
    id: 'ad3',
    title: 'באנר אמצע דף',
    area: 'homepage_mid',
    isActive: true,
    slides: [
      {
        id: 's4',
        imageUrl: 'https://picsum.photos/id/555/1200/300',
        linkUrl: '#'
      },
       {
        id: 's5',
        imageUrl: 'https://picsum.photos/id/666/1200/300',
        linkUrl: '#'
      }
    ]
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: '1',
    userId: 'u2',
    userName: 'דוד כהן',
    content: 'כל הכבוד לעירייה על ההיערכות המוקדמת!',
    date: '2023-10-24 10:30',
    likes: 5,
    likedBy: []
  },
  {
    id: 'c2',
    postId: '1',
    userId: 'u3',
    userName: 'שרה לוי',
    content: 'מקווה שלא יחסמו את הכניסה לעיר, אני צריכה להגיע לעבודה.',
    date: '2023-10-24 11:15',
    likes: 2,
    likedBy: []
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u2',
    name: 'דוד כהן',
    email: 'david@example.com',
    password: 'password123',
    role: 'user',
    isAuthenticated: false,
    joinedDate: '2023-09-15'
  },
  {
    id: 'u3',
    name: 'שרה לוי',
    email: 'sara@example.com',
    password: 'password123',
    role: 'user',
    isAuthenticated: false,
    joinedDate: '2023-10-01'
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
    {
        id: 'm1',
        name: 'ישראל ישראלי',
        email: 'israel@test.com',
        phone: '050-1234567',
        subject: 'הצעה לכתבה',
        message: 'שלום, יש לי סיפור מעניין על...',
        date: '2023-10-20 10:00',
        read: false
    }
];

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
    {
        id: 's1',
        email: 'subscriber1@example.com',
        joinedDate: '2023-10-01',
        isActive: true
    }
];
