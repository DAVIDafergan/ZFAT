export const SITE_NAME = 'צפת בתנופה';
export const SITE_TAGLINE = 'חדשות צפת, קהילה, נדל"ן והעיתון השבועי';
export const LOGO_URL = 'https://github.com/user-attachments/assets/8ea523f7-40f8-4cdc-9144-abff2da50d6a';

const readEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key] as string | undefined;
  } catch {
    return undefined;
  }
};

const trimSlash = (value: string) => value.replace(/\/$/, '');

export const API_URL = (() => {
  const configured = readEnv('VITE_API_URL');
  if (configured) return trimSlash(configured);
  if (typeof window !== 'undefined') return trimSlash(window.location.origin);
  return 'http://localhost:3001';
})();

export const SITE_URL = (() => {
  const configured = readEnv('VITE_PUBLIC_SITE_URL') || readEnv('VITE_API_URL');
  if (configured) return trimSlash(configured);
  if (typeof window !== 'undefined') return trimSlash(window.location.origin);
  return 'http://localhost:5173';
})();

export const USE_SERVER = readEnv('VITE_USE_SERVER') !== 'false';

export const normalizeShareCode = (value?: string | null, fallback = '') => {
  const source = `${value || ''}`.trim();
  const digits = source.replace(/\D/g, '');
  if (digits) return digits.slice(-6);
  const fallbackDigits = `${fallback}`.replace(/\D/g, '');
  return fallbackDigits ? fallbackDigits.slice(-6) : '';
};

export const buildArticleUrl = (id: string) => `${SITE_URL}/#/article/${id}`;

export const buildShortPostUrl = (shortCode?: string | null, postId?: string) => {
  const code = normalizeShareCode(shortCode, postId);
  return code ? `${SITE_URL}/p/${code}` : buildArticleUrl(postId || '');
};

export const formatWeekLabel = (weekKey: string) => {
  if (!weekKey) return '';
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekKey;
  return `שבוע ${match[2]} / ${match[1]}`;
};

export const cleanPhoneNumber = (value: string) => value.replace(/[^\d]/g, '');

export const buildListingWhatsappUrl = (title: string, phone: string) => {
  const clean = cleanPhoneNumber(phone);
  if (!clean) return '#';
  const localIsraeli = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
  const text = encodeURIComponent(`הגעתי דרך לוח בתנופה ואני מתעניין/ת בדירה: ${title}`);
  return `https://wa.me/${localIsraeli}?text=${text}`;
};
