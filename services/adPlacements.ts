import { AdArea } from '../types';

export interface AdPlacementMeta {
  area: AdArea;
  label: string;
  page: string;
  recommendedSize: string;
  guidance: string;
}

export const AD_PLACEMENTS: AdPlacementMeta[] = [
  { area: 'leaderboard', label: 'באנר עליון ראשי', page: 'דף הבית', recommendedSize: '1200x250', guidance: 'תמונה/וידאו רוחבי רחב לפתיחה' },
  { area: 'homepage_mid', label: 'באנר מרכזי בית', page: 'דף הבית', recommendedSize: '1200x300', guidance: 'מתאים לקמפיין מרכזי בין אזורי תוכן' },
  { area: 'homepage_feed', label: 'באנר בתחתית פיד', page: 'דף הבית', recommendedSize: '1200x220', guidance: 'קריאה לפעולה עדינה בסיום הפיד' },
  { area: 'sidebar', label: 'באנר צד', page: 'דף הבית', recommendedSize: '360x600', guidance: 'תצוגת תמונה סטטית באזור הצד' },
  { area: 'sidebar_video', label: 'וידאו צד', page: 'דף הבית', recommendedSize: '360x640', guidance: 'וידאו אנכי או תמונה חלופית' },
  { area: 'article_inline', label: 'באנר בתוך כתבה', page: 'עמוד כתבה', recommendedSize: '1200x250', guidance: 'מיקום בין פתיח לתוכן הכתבה' },
  { area: 'article_bottom', label: 'באנר תחתון כתבה', page: 'עמוד כתבה', recommendedSize: '1200x300', guidance: 'מיקום אחרי גוף הכתבה ולפני תגובות' },
  { area: 'category_top', label: 'באנר עליון קטגוריה', page: 'עמוד קטגוריה', recommendedSize: '1200x220', guidance: 'מופיע אחרי כותרת הקטגוריה' },
  { area: 'category_mid', label: 'באנר אמצע קטגוריה', page: 'עמוד קטגוריה', recommendedSize: '1200x220', guidance: 'מופיע באמצע רשימת הכתבות' },
  { area: 'weekly_top', label: 'באנר עיתון שבועי', page: 'העיתון השבועי', recommendedSize: '1200x240', guidance: 'מופיע מעל רשימת המהדורות' },
  { area: 'board_top', label: 'באנר לוח בתנופה', page: 'לוח בתנופה', recommendedSize: '1200x240', guidance: 'מופיע אחרי סרגל הסינון' },
  { area: 'contact_top', label: 'באנר עמוד צור קשר', page: 'צור קשר', recommendedSize: '1200x220', guidance: 'מופיע מתחת לבאנר העמוד' },
  { area: 'search_top', label: 'באנר עמוד חיפוש', page: 'תוצאות חיפוש', recommendedSize: '1200x220', guidance: 'מופיע בין כותרת לתוצאות' },
];

export const AD_PLACEMENT_MAP: Record<AdArea, AdPlacementMeta> = AD_PLACEMENTS.reduce((acc, placement) => {
  acc[placement.area] = placement;
  return acc;
}, {} as Record<AdArea, AdPlacementMeta>);
