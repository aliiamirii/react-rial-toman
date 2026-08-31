const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const LATIN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export type DigitLocale = 'en' | 'fa';
export type MoneyUnit = 'rial' | 'toman';

/** The classic, still-most-common ratio: 1 toman = 10 rials. */
export const DEFAULT_RATIO = 10;

/**
 * Converts Latin digits (0-9) in a string/number to Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Converts Persian digits (۰-۹) in a string back to Latin digits (0-9).
 * Non-Persian characters are left untouched.
 */
export function toLatinDigits(input: string): string {
  let result = input;
  PERSIAN_DIGITS.forEach((pDigit, i) => {
    result = result.split(pDigit).join(LATIN_DIGITS[i]);
  });
  return result;
}

/**
 * Strips everything except digits, a single leading minus sign, and a decimal
 * point from a string. Persian digits are normalized to Latin first.
 */
export function stripNonDigits(input: string): string {
  const latin = toLatinDigits(input);
  const negative = latin.trim().startsWith('-');
  const cleaned = latin.replace(/[^\d.]/g, '');
  return negative ? `-${cleaned}` : cleaned;
}

/**
 * Parses a formatted (or partially formatted) string into a raw number.
 * Handles thousands separators, Persian digits, and stray characters.
 * Returns 0 for empty/invalid input rather than NaN, so it's safe to use
 * directly in controlled-input onChange handlers.
 */
export function parseNumber(input: string | number): number {
  if (typeof input === 'number') return input;
  const cleaned = stripNonDigits(input);
  if (cleaned === '' || cleaned === '-') return 0;
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Groups the integer part of a number into sets of three digits.
 * e.g. groupDigits(1234567) -> "1,234,567"
 *      groupDigits(-1234.5) -> "-1,234.5"
 */
export function groupDigits(value: number | string, separator = ','): string {
  const num = typeof value === 'number' ? value : parseNumber(value);
  const isNegative = num < 0;
  const [intPart, decPart] = Math.abs(num).toString().split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const sign = isNegative ? '-' : '';
  return decPart ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

export interface FormatNumberOptions {
  /** Character(s) placed between each group of three digits. Default: ",". */
  separator?: string;
  /** Render the result in Persian (فارسی) or Latin digits. Default: "en". */
  digits?: DigitLocale;
}

/**
 * Groups digits AND applies digit-locale conversion in one call.
 * This is the function most consumers want.
 */
export function formatNumber(value: number | string, options: FormatNumberOptions = {}): string {
  const { separator = ',', digits = 'en' } = options;
  const grouped = groupDigits(value, separator);
  return digits === 'fa' ? toPersianDigits(grouped) : grouped;
}

/** Converts a Rial amount to Toman. Default ratio is 10 (1 toman = 10 rial). */
export function rialToToman(rial: number, ratio: number = DEFAULT_RATIO): number {
  return rial / ratio;
}

/** Converts a Toman amount to Rial. Default ratio is 10 (1 toman = 10 rial). */
export function tomanToRial(toman: number, ratio: number = DEFAULT_RATIO): number {
  return toman * ratio;
}

/**
 * Converts a value between the two units. No-op if from === to.
 */
export function convert(value: number, from: MoneyUnit, to: MoneyUnit, ratio: number = DEFAULT_RATIO): number {
  if (from === to) return value;
  return from === 'rial' ? rialToToman(value, ratio) : tomanToRial(value, ratio);
}

// ---------------------------------------------------------------------------
// Persian number-to-words
// ---------------------------------------------------------------------------

const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const TEENS = [
  'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده',
  'شانزده', 'هفده', 'هجده', 'نوزده',
];
const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const HUNDREDS = [
  '', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد',
  'ششصد', 'هفتصد', 'هشتصد', 'نهصد',
];
const SCALES = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون'];

/** Converts a 0-999 integer into Persian words. Returns '' for 0. */
function threeDigitGroupToWords(n: number): string {
  if (n === 0) return '';
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;

  if (h > 0) parts.push(HUNDREDS[h]);

  if (rest >= 10 && rest < 20) {
    parts.push(TEENS[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t > 0) parts.push(TENS[t]);
    if (o > 0) parts.push(ONES[o]);
  }

  return parts.join(' و ');
}

/**
 * Spells out an integer in Persian words, e.g. 500000 -> "پانصد هزار".
 * Supports negative numbers and values up to the quadrillions. Non-integer
 * input is floored (words for fractional Rial/Toman amounts aren't
 * meaningful in practice).
 */
export function numberToPersianWords(value: number): string {
  const n = Math.trunc(value);

  if (n === 0) return 'صفر';

  const isNegative = n < 0;
  let remaining = Math.abs(n);

  const groups: number[] = [];
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;
    const groupWords = threeDigitGroupToWords(group);
    const scale = SCALES[i];
    words.push(scale ? `${groupWords} ${scale}` : groupWords);
  }

  const result = words.join(' و ');
  return isNegative ? `منفی ${result}` : result;
}
