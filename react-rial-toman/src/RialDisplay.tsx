import React from 'react';
import { DigitLocale, MoneyUnit, convert, formatNumber } from './core';

export interface RialDisplayProps {
  /** The raw numeric value, in `unit`. */
  value: number;
  /** Which unit `value` is expressed in. Default: "rial". */
  unit?: MoneyUnit;
  /** Render digits in Persian (فارسی) or Latin numerals. Default: "en". */
  digits?: DigitLocale;
  /** Thousands separator. Default: ",". */
  separator?: string;
  /** Rial-per-Toman ratio, in case it ever changes. Default: 10. */
  ratio?: number;
  /** Order the two units are rendered in. Default: [unit, otherUnit]. */
  order?: MoneyUnit[];
  /** Labels appended after each formatted number. */
  labels?: { rial: string; toman: string };
  /** String placed between the two unit values. Default: " / ". */
  joiner?: string;
  className?: string;
}

/**
 * Read-only, always-visible display of a money value in both Rial and Toman.
 * e.g. <RialDisplay value={500000} unit="rial" /> renders:
 *   "500,000 ریال / 50,000 تومان"
 */
export function RialDisplay({
  value,
  unit = 'rial',
  digits = 'en',
  separator = ',',
  ratio = 10,
  order,
  labels = { rial: 'ریال', toman: 'تومان' },
  joiner = ' / ',
  className,
}: RialDisplayProps) {
  const otherUnit: MoneyUnit = unit === 'rial' ? 'toman' : 'rial';
  const values: Record<MoneyUnit, number> = {
    [unit]: value,
    [otherUnit]: convert(value, unit, otherUnit, ratio),
  } as Record<MoneyUnit, number>;

  const displayOrder = order ?? [unit, otherUnit];

  return (
    <span className={className}>
      {displayOrder
        .map((u) => `${formatNumber(values[u], { separator, digits })} ${labels[u]}`)
        .join(joiner)}
    </span>
  );
}
