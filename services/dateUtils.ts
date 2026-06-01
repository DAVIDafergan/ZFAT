const hebrewDateFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

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
  return hebrewDateFormatter.format(parsedDate);
};
