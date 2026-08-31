import React, { useCallback, useEffect, useState } from 'react';
import { DigitLocale, MoneyUnit, convert, formatNumber, numberToPersianWords, parseNumber } from './core';
import { InputSize, cn, resolveColor } from './utils';

export interface RialInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size' | 'color'> {
  /** The raw numeric value, in `currency`. This is the source of truth — never pass the formatted string. */
  value: number;
  /** Called with the raw numeric value whenever the user edits the field. */
  onChange: (value: number) => void;

  /** Field label rendered above the input. */
  label?: string;
  /** Validation/error message rendered below the input. When set, the input gets an error style. */
  error?: string;

  /** Controls padding and font size. Default: "md". */
  size?: InputSize;
  /** Border/focus-ring color. Accepts "primary" | "success" | "danger" | "neutral", or any raw CSS color string. Default: "primary". */
  color?: string;
  /** Color of the typed text itself (any CSS color string). */
  textColor?: string;

  /** Which unit `value` is expressed in — also controls the label used for showWords. Default: "toman". */
  currency?: MoneyUnit;
  /** Render digits in Persian (فارسی) or Latin numerals. Default: "fa". */
  digits?: DigitLocale;
  /** Thousands separator. Default: ",". */
  separator?: string;
  /** Rial-per-Toman ratio, in case it ever changes. Default: 10. */
  ratio?: number;

  /** Show a small helper line under the input with the value converted to the other unit. Default: false. */
  showConversion?: boolean;
  /** Labels used in the conversion helper line. */
  conversionLabels?: { rial: string; toman: string };
  /** Show the value spelled out in Persian words under the input (e.g. "پانصد هزار تومان"). Default: false. */
  showWords?: boolean;

  /** Text direction for the input. Default: "rtl". */
  dir?: 'rtl' | 'ltr';
  /** className applied to the outer wrapping <div> — escape hatch for custom Tailwind/CSS. */
  className?: string;
}

/**
 * A themeable, labeled money input that live-formats digits into
 * thousands-groups as the user types, and can optionally show the
 * Rial<->Toman equivalent and/or the value spelled out in Persian words.
 *
 * Fully controlled: you own `value` and `onChange`, and always
 * receive/pass a plain number, never a formatted string.
 *
 * Ships with a small plain-CSS stylesheet (no Tailwind required) — import
 * it once in your app:
 *   import 'react-rial-toman/dist/style.css'
 */
export function RialInput({
  value,
  onChange,
  label,
  error,
  size = 'md',
  color = 'primary',
  textColor,
  currency = 'toman',
  digits = 'fa',
  separator = ',',
  ratio = 10,
  showConversion = false,
  conversionLabels = { rial: 'ریال', toman: 'تومان' },
  showWords = false,
  dir = 'rtl',
  className,
  disabled,
  placeholder,
  id,
  ...inputProps
}: RialInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatNumber(value, { separator, digits })
  );

  // Keep the display in sync if `value` changes from outside (e.g. reset, prefill).
  useEffect(() => {
    setDisplayValue(formatNumber(value, { separator, digits }));
  }, [value, separator, digits]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseNumber(e.target.value);
      setDisplayValue(formatNumber(raw, { separator, digits }));
      onChange(raw);
    },
    [onChange, separator, digits]
  );

  const otherUnit: MoneyUnit = currency === 'rial' ? 'toman' : 'rial';
  const convertedValue = convert(value, currency, otherUnit, ratio);

  const colorVars = resolveColor(color);
  const style: React.CSSProperties = {
    ...colorVars,
    ...(textColor ? { color: textColor } : {}),
  };

  return (
    <div className={cn('rrt-field', className)}>
      {label && (
        <label className="rrt-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={id}
        type="text"
        inputMode="numeric"
        dir={dir}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        style={style}
        className={cn('rrt-input', `rrt-input--${size}`, error && 'rrt-input--error')}
      />
      {showWords && (
        <span className="rrt-words">
          {numberToPersianWords(value)} {currency === 'toman' ? 'تومان' : 'ریال'}
        </span>
      )}
      {showConversion && (
        <span className="rrt-words">
          = {formatNumber(convertedValue, { separator, digits })} {conversionLabels[otherUnit]}
        </span>
      )}
      {error && <span className="rrt-error">{error}</span>}
    </div>
  );
}
