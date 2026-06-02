const hebrewDateFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jerusalem',
});

const hebrewPartsFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jerusalem',
});

const HEBREW_ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const HEBREW_TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HEBREW_HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת'];
const addHebrewYearPunctuation = (text: string): string => {
  if (text.length <= 1) return `${text}'`;
  return `${text.slice(0, -1)}"${text.slice(-1)}`;
};

const buildHebrewNumberText = (value: number): string => {
  if (!Number.isInteger(value) || value <= 0 || value >= 1000) {
    return String(value);
  }

  let remaining = value;
  let result = '';

  while (remaining >= 400) {
    result += HEBREW_HUNDREDS[4];
    remaining -= 400;
  }

  if (remaining >= 100) {
    const hundreds = Math.floor(remaining / 100);
    result += HEBREW_HUNDREDS[hundreds];
    remaining %= 100;
  }

  if (remaining === 15) return `${result}טו`;
  if (remaining === 16) return `${result}טז`;

  if (remaining >= 10) {
    const tens = Math.floor(remaining / 10);
    result += HEBREW_TENS[tens];
    remaining %= 10;
  }

  if (remaining > 0) {
    result += HEBREW_ONES[remaining];
  }

  return result;
};

const formatHebrewDay = (value: number): string => `${buildHebrewNumberText(value)}'`;

const formatHebrewYear = (value: number): string => addHebrewYearPunctuation(buildHebrewNumberText(value));

const createUtcDate = (
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
): Date | null => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    utcDate.getUTCFullYear() !== year
    || utcDate.getUTCMonth() !== month - 1
    || utcDate.getUTCDate() !== day
    || utcDate.getUTCHours() !== hour
    || utcDate.getUTCMinutes() !== minute
  ) {
    return null;
  }
  return utcDate;
};

const parseDateValue = (value: string): Date | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const isoDateOnlyMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDateOnlyMatch) {
    const [, yearText, monthText, dayText] = isoDateOnlyMatch;
    return createUtcDate(Number(yearText), Number(monthText), Number(dayText), 12, 0);
  }

  const isoDateTimeNoTzMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (isoDateTimeNoTzMatch) {
    const [, yearText, monthText, dayText, hourText, minuteText] = isoDateTimeNoTzMatch;
    return createUtcDate(Number(yearText), Number(monthText), Number(dayText), Number(hourText), Number(minuteText));
  }

  const dateOnlyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (dateOnlyMatch) {
    const [, dayText, monthText, yearText] = dateOnlyMatch;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    return createUtcDate(year, month, day, 12, 0);
  }

  const withTimeMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\s+(\d{1,2}):(\d{2})$/);
  if (withTimeMatch) {
    const [, dayText, monthText, yearText, hourText, minuteText] = withTimeMatch;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    return createUtcDate(year, month, day, hour, minute);
  }

  const nativeParsed = new Date(trimmed);
  if (!Number.isNaN(nativeParsed.getTime())) {
    return nativeParsed;
  }

  return null;
};

const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jerusalem',
});

const gregorianFormatterWithTime = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jerusalem',
});

export const formatGregorianDate = (value: string, showTime = false): string => {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return value;
  return showTime
    ? gregorianFormatterWithTime.format(parsedDate)
    : gregorianFormatter.format(parsedDate);
};

export const formatHebrewDate = (value: string): string => {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) {
    console.error('[formatHebrewDate] Cannot parse date value:', value);
    return 'תאריך לא זמין';
  }

  const parts = hebrewPartsFormatter.formatToParts(parsedDate);
  const day = parts.find((part) => part.type === 'day')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const year = parts.find((part) => part.type === 'year')?.value;

  if (!day || !month || !year) {
    return hebrewDateFormatter.format(parsedDate);
  }

  const hebrewDay = formatHebrewDay(Number(day));
  const hebrewYear = formatHebrewYear(Number(year) % 1000);

  return `${hebrewDay} ${month} ${hebrewYear}`;
};

/**
 * Server-side validation: verifies that a given date string can be converted
 * to a Hebrew date.  Returns the formatted Hebrew date string on success, or
 * null if the value is missing/unparseable (so callers know not to display it).
 */
export const validateAndFormatHebrewDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return null;
  return formatHebrewDate(value);
};

const timeFormatter = new Intl.DateTimeFormat('he-IL', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jerusalem',
});

export const formatPublishTime = (value: string | undefined | null): string => {
  if (!value) return '';
  // הצג שעה רק אם יש T בערך — כלומר ISO datetime אמיתי, לא רק תאריך
  if (!/T\d{2}:\d{2}/.test(value)) return '';
  const parsed = parseDateValue(value);
  if (!parsed) return '';
  return timeFormatter.format(parsed);
};

export const resolvePostDateForDisplay = (
  publishedAt?: string,
  createdAt?: string,
  date?: string,
): string => publishedAt || createdAt || date || '';
