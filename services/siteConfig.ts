import { formatHebrewDate } from './dateUtils';

export const SITE_NAME = 'צפת בתנופה';
export const SITE_TAGLINE = 'חדשות צפת, קהילה, נדל"ן והעיתון השבועי';
export const LOGO_URL = '/logo.png';

const readEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key] as string | undefined;
  } catch {
    return undefined;
  }
};

const trimSlash = (value: string) => value.replace(/\/$/, '');
const DEFAULT_SITE_URL = 'https://zfatbitnufa.com';
const getBrowserOrigin = () => (typeof window !== 'undefined' ? trimSlash(window.location.origin) : '');

export const API_URL = (() => {
  const configured = readEnv('VITE_API_URL');
  if (configured) return trimSlash(configured);
  return getBrowserOrigin() || DEFAULT_SITE_URL;
})();

export const SITE_URL = (() => {
  const configured = readEnv('VITE_PUBLIC_SITE_URL') || readEnv('VITE_API_URL');
  if (configured) return trimSlash(configured);
  return getBrowserOrigin() || DEFAULT_SITE_URL;
})();

export const USE_SERVER = readEnv('VITE_USE_SERVER') !== 'false';
export const SITE_WHATSAPP_NUMBER = '972525981770';
export const SITE_WHATSAPP_URL = `https://wa.me/${SITE_WHATSAPP_NUMBER}`;

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

export const getWeeklyPaperDateLabel = (paper: { hebrewDate?: string; weekKey?: string; publishedAt?: string }) => {
  const hebrewDate = paper.hebrewDate?.trim();
  if (hebrewDate) return hebrewDate;
  if (paper.weekKey) return formatWeekLabel(paper.weekKey);
  if (paper.publishedAt) return formatHebrewDate(paper.publishedAt);
  return '';
};

export const cleanPhoneNumber = (value: string) => value.replace(/[^\d]/g, '');

export const buildListingWhatsappUrl = (title: string, phone: string) => {
  const clean = cleanPhoneNumber(phone);
  if (!clean) return '#';
  const localIsraeli = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
  const text = encodeURIComponent(`הגעתי דרך לוח בתנופה באתר צפת בתנופה ואני מתעניין/ת בדירה: ${title}`);
  return `https://wa.me/${localIsraeli}?text=${text}`;
};
