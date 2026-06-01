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

const parseDateValue = (value: string): Date | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const nativeParsed = new Date(trimmed);
  if (!Number.isNaN(nativeParsed.getTime())) return nativeParsed;

  const dateOnlyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (dateOnlyMatch) {
    const [, dayText, monthText, yearText] = dateOnlyMatch;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    const parsed = new Date(year, month - 1, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const withTimeMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\s+(\d{1,2}):(\d{2})$/);
  if (withTimeMatch) {
    const [, dayText, monthText, yearText, hourText, minuteText] = withTimeMatch;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText.length === 2 ? `20${yearText}` : yearText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const parsed = new Date(year, month - 1, day, hour, minute);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export const formatHebrewDate = (value: string): string => {
  const parsedDate = parseDateValue(value) || new Date();
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
