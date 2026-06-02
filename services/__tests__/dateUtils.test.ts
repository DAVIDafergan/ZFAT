import { describe, it, expect } from 'vitest';
import { formatHebrewDate, validateAndFormatHebrewDate } from '../dateUtils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Checks that the returned string is NOT the fallback "date unavailable" text
 * and contains at least one Hebrew character (indicating a real Hebrew date).
 */
const isRealHebrewDate = (value: string) =>
  value !== 'תאריך לא זמין' && /[\u05D0-\u05EA]/.test(value);

// ---------------------------------------------------------------------------
// formatHebrewDate — regular dates
// ---------------------------------------------------------------------------

describe('formatHebrewDate — regular dates', () => {
  it('formats an ISO date string', () => {
    const result = formatHebrewDate('2024-03-15');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('formats a full ISO datetime string', () => {
    const result = formatHebrewDate('2024-03-15T08:30:00.000Z');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('formats a dd.mm.yyyy date string', () => {
    const result = formatHebrewDate('15.03.2024');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('formats a dd/mm/yyyy date string', () => {
    const result = formatHebrewDate('15/03/2024');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('formats an ISO datetime without timezone suffix', () => {
    const result = formatHebrewDate('2024-03-15 08:30');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('formats a dd-mm-yyyy date string', () => {
    const result = formatHebrewDate('15-03-2024');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('returns the same Hebrew date for equivalent ISO and locale formats', () => {
    // 2024-01-15 in Jerusalem is the same calendar day regardless of representation
    const fromIso = formatHebrewDate('2024-01-15');
    const fromLocale = formatHebrewDate('15.01.2024');
    expect(fromIso).toBe(fromLocale);
  });

  it('uses Asia/Jerusalem timezone (does not shift date at UTC midnight)', () => {
    // 2024-01-15T00:00:00Z is Jan 15 at 02:00 Jerusalem (UTC+2 in Jan)
    // so the Hebrew date should represent January 15, not January 14
    const result = formatHebrewDate('2024-01-15T00:00:00.000Z');
    expect(isRealHebrewDate(result)).toBe(true);
    // Compare against unambiguous midday value which is definitely Jan 15
    const midday = formatHebrewDate('2024-01-15T12:00:00.000Z');
    expect(result).toBe(midday);
  });
});

// ---------------------------------------------------------------------------
// formatHebrewDate — missing / invalid dates must NEVER fall back to today
// ---------------------------------------------------------------------------

describe('formatHebrewDate — missing or invalid input', () => {
  it('returns תאריך לא זמין for empty string', () => {
    expect(formatHebrewDate('')).toBe('תאריך לא זמין');
  });

  it('returns תאריך לא זמין for whitespace-only string', () => {
    expect(formatHebrewDate('   ')).toBe('תאריך לא זמין');
  });

  it('returns תאריך לא זמין for a completely invalid value', () => {
    expect(formatHebrewDate('not-a-date')).toBe('תאריך לא זמין');
  });

  it('returns תאריך לא זמין for impossible calendar date', () => {
    expect(formatHebrewDate('31/02/2024')).toBe('תאריך לא זמין');
  });

  it('returns תאריך לא זמין for malformed ISO date', () => {
    expect(formatHebrewDate('2024-13-40')).toBe('תאריך לא זמין');
  });

  it('never returns today\'s date when input is invalid', () => {
    const result = formatHebrewDate('garbage');
    // If it returned today it would be a real Hebrew date string; it must not
    expect(result).toBe('תאריך לא זמין');
  });
});

// ---------------------------------------------------------------------------
// formatHebrewDate — Hebrew leap years
// ---------------------------------------------------------------------------

describe('formatHebrewDate — Hebrew leap years', () => {
  it('handles a date in Hebrew year 5784 (a regular year)', () => {
    // 2024-03-15 falls in Adar 5784 (regular year – no Adar II)
    const result = formatHebrewDate('2024-03-15');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('handles a date in Hebrew year 5782 (a leap year with Adar I & II)', () => {
    // 2022-03-05 falls in Adar I 5782
    const result = formatHebrewDate('2022-03-05');
    expect(isRealHebrewDate(result)).toBe(true);
    // 2022-04-03 falls in Adar II / Nissan 5782
    const result2 = formatHebrewDate('2022-04-03');
    expect(isRealHebrewDate(result2)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatHebrewDate — Gregorian/Hebrew day parity
// ---------------------------------------------------------------------------

describe('formatHebrewDate — day stays the same across representations', () => {
  const cases = [
    '2023-10-24',
    '2024-01-01',
    '2024-12-31',
    '2025-06-15',
  ];

  for (const iso of cases) {
    it(`ISO "${iso}" and locale dd.mm.yyyy produce the same Hebrew date`, () => {
      const [year, month, day] = iso.split('-');
      const locale = `${day}.${month}.${year}`;
      expect(formatHebrewDate(iso)).toBe(formatHebrewDate(locale));
    });
  }
});

// ---------------------------------------------------------------------------
// formatHebrewDate — DST transition (Israel switches in March/October)
// ---------------------------------------------------------------------------

describe('formatHebrewDate — DST transition dates', () => {
  it('handles the spring DST transition (last Friday of March)', () => {
    // Israel springs forward on the last Friday of March
    // 2024-03-29: clocks move from UTC+2 to UTC+3 at 02:00
    const result = formatHebrewDate('2024-03-29');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('handles the autumn DST transition (last Sunday of October)', () => {
    // 2023-10-29: Israel falls back from UTC+3 to UTC+2
    const result = formatHebrewDate('2023-10-29');
    expect(isRealHebrewDate(result)).toBe(true);
  });

  it('midnight UTC on DST change day maps to a valid Hebrew date', () => {
    // 2024-03-29T00:00:00Z = 02:00 Israel time (still in UTC+2 before the switch)
    const midnight = formatHebrewDate('2024-03-29T00:00:00.000Z');
    const midday = formatHebrewDate('2024-03-29T12:00:00.000Z');
    expect(isRealHebrewDate(midnight)).toBe(true);
    expect(isRealHebrewDate(midday)).toBe(true);
    // Both should be the same Israeli calendar date
    expect(midnight).toBe(midday);
  });
});

// ---------------------------------------------------------------------------
// validateAndFormatHebrewDate
// ---------------------------------------------------------------------------

describe('validateAndFormatHebrewDate', () => {
  it('returns a Hebrew date string for a valid ISO date', () => {
    const result = validateAndFormatHebrewDate('2024-06-01');
    expect(result).not.toBeNull();
    expect(isRealHebrewDate(result!)).toBe(true);
  });

  it('returns null for an empty string', () => {
    expect(validateAndFormatHebrewDate('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(validateAndFormatHebrewDate(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(validateAndFormatHebrewDate(undefined)).toBeNull();
  });

  it('returns null for an unparseable value', () => {
    expect(validateAndFormatHebrewDate('not-a-date-at-all')).toBeNull();
  });
});
