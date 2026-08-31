react-rial-toman
Live thousands-grouping input and Rial ⇄ Toman conversion display components for React — built for Iranian currency UIs.

Iran's currency is officially the Rial (IRR), but everyday prices are almost always spoken and written in Toman (1 Toman = 10 Rials, traditionally — see A note on the conversion ratio below). This package gives you two small, composable React components plus the plain-JS utilities behind them, so you can:

Format long numbers with thousands separators as the user types (1234567 → 1,234,567)
Show a value in both Rial and Toman at once, always visible, no interaction required
Support Persian numerals (۰-۹) alongside Latin ones
Keep raw numeric values as the source of truth, never formatted strings
Installation
npm install react-rial-toman
# or
yarn add react-rial-toman
# or
pnpm add react-rial-toman
react (>=17) is a peer dependency and is not bundled.

RialInput ships with a small plain-CSS stylesheet (no Tailwind required — it works whether or not your app uses Tailwind). Import it once, anywhere near the root of your app:

import 'react-rial-toman/dist/style.css';
Quick start
Input with live formatting
import { useState } from 'react';
import { RialInput } from 'react-rial-toman';
import 'react-rial-toman/dist/style.css';

function PriceForm() {
  const [price, setPrice] = useState(0); // always a raw number, in `currency`

  return (
    <RialInput
      label="قیمت محصول"
      placeholder="مبلغ را وارد کنید"
      size="md"
      color="primary"
      currency="toman"
      showWords
      showConversion
      value={price}
      onChange={setPrice}
    />
  );
}
As the user types 500000, the field displays ۵۰۰,۰۰۰, a line underneath spells it out — پانصد هزار تومان — and (with showConversion) another line shows the Rial equivalent — = ۵,۰۰۰,۰۰۰ ریال.

Read-only dual display
import { RialDisplay } from 'react-rial-toman';

function ProductPrice({ priceInRial }: { priceInRial: number }) {
  return <RialDisplay value={priceInRial} unit="rial" />;
}

// Renders: 500,000 ریال / 50,000 تومان
Why raw numbers, not formatted strings?
Every component in this package is controlled and always passes/receives a plain number — never a comma-formatted string. This is a deliberate design choice:

You never have to strip commas back out before saving to a database or sending to an API.
Rounding stays consistent no matter how many times a value is converted or re-rendered.
It matches how native <input type="number"> and most form libraries (React Hook Form, Formik) expect controlled values to behave.
If you need the formatted string for your own purposes, formatNumber() is exported and safe to call directly.

API reference
<RialInput />
A themeable, labeled money input that live-formats digits into thousands-groups as the user types, and can optionally show the value spelled out in Persian words and/or converted to the other unit.

Prop	Type	Default	Description
value	number	— (required)	Raw numeric value, expressed in currency. Source of truth.
onChange	(value: number) => void	— (required)	Called with the raw numeric value on every edit.
label	string	—	Field label rendered above the input.
error	string	—	Validation message rendered below the input; also applies an error border style.
size	'sm' | 'md' | 'lg'	'md'	Controls padding and font size.
color	string	'primary'	Border/focus-ring color. Accepts the tokens 'primary' | 'success' | 'danger' | 'neutral', or any raw CSS color (e.g. '#ff6600', 'rgb(0,150,80)') for full custom theming.
textColor	string	—	Color of the typed text itself (any CSS color string).
currency	'rial' | 'toman'	'toman'	Which unit value is expressed in.
digits	'en' | 'fa'	'fa'	Render Persian (۰-۹) or Latin (0-9) numerals.
separator	string	','	Thousands separator character(s).
ratio	number	10	Rial-per-Toman ratio. See note below.
showConversion	boolean	false	Show a helper line under the input with the value converted to the other unit.
conversionLabels	{ rial: string; toman: string }	{ rial: 'ریال', toman: 'تومان' }	Labels used in the conversion helper line.
showWords	boolean	false	Show the value spelled out in Persian words under the input (e.g. پانصد هزار تومان).
disabled	boolean	false	Standard disabled state.
dir	'rtl' | 'ltr'	'rtl'	Text direction of the input.
className	string	—	Applied to the outer wrapping <div> — escape hatch for custom Tailwind/CSS.
...rest	InputHTMLAttributes	—	Any other standard <input> prop (id, name, autoFocus, etc.) is passed through.
Styling model: rather than requiring Tailwind, RialInput ships its own tiny stylesheet (react-rial-toman/dist/style.css) built on CSS custom properties. color and size map to real CSS classes/variables under the hood, so the component looks consistent out of the box, but className and textColor always let you override anything — including with Tailwind classes, if that's what your app uses.

<RialDisplay />
A read-only <span> that always shows a value in both units at once.

Prop	Type	Default	Description
value	number	— (required)	Raw numeric value, expressed in unit.
unit	'rial' | 'toman'	'rial'	Which unit value is expressed in.
digits	'en' | 'fa'	'en'	Render Latin or Persian numerals.
separator	string	','	Thousands separator character(s).
ratio	number	10	Rial-per-Toman ratio.
order	('rial' | 'toman')[]	[unit, otherUnit]	Order the two values render in.
labels	{ rial: string; toman: string }	{ rial: 'ریال', toman: 'تومان' }	Labels appended after each value.
joiner	string	' / '	String placed between the two unit values.
className	string	—	Applied to the wrapping <span>.
Core functions (framework-agnostic)
These have no React dependency and work in Node, vanilla JS, Vue, etc.

import {
  groupDigits,
  formatNumber,
  parseNumber,
  toPersianDigits,
  toLatinDigits,
  stripNonDigits,
  rialToToman,
  tomanToRial,
  convert,
  DEFAULT_RATIO,
} from 'react-rial-toman';
Function	Signature	Description
groupDigits	(value: number | string, separator = ',') => string	Groups the integer part of a number into sets of three.
formatNumber	(value: number | string, options?: { separator?, digits? }) => string	groupDigits + Persian/Latin digit conversion in one call.
parseNumber	(input: string | number) => number	Parses a formatted (or partially typed) string back into a raw number. Handles separators, Persian digits, and invalid input (returns 0 rather than NaN).
toPersianDigits	(input: string | number) => string	Converts Latin digits to Persian digits.
toLatinDigits	(input: string) => string	Converts Persian digits to Latin digits.
stripNonDigits	(input: string) => string	Removes everything except digits, one leading minus sign, and a decimal point.
rialToToman	(rial: number, ratio = 10) => number	Converts Rial to Toman.
tomanToRial	(toman: number, ratio = 10) => number	Converts Toman to Rial.
convert	(value: number, from: MoneyUnit, to: MoneyUnit, ratio = 10) => number	Generic converter; no-op if from === to.
numberToPersianWords	(value: number) => string	Spells out an integer in Persian words, e.g. 500000 → "پانصد هزار". Handles negatives and values up to the quadrillions; non-integer input is floored.
DEFAULT_RATIO	10	The default Rial-per-Toman ratio used everywhere above.
Persian digit support
Pass digits="fa" to either component, or call formatNumber(value, { digits: 'fa' }) directly, to render Persian numerals:

<RialDisplay value={500000} digits="fa" />
// 500,000 → ۵۰۰,۰۰۰ ریال / ۵۰,۰۰۰ تومان
parseNumber accepts Persian digits on input regardless of the digits display setting, so users can type with a Persian keyboard and still get a correct numeric value back.

A note on the conversion ratio
Historically and in everyday use today, 1 Toman = 10 Rials — this is the package default (ratio = 10).

Iran's government has an official, long-pending plan to redenominate the currency and formally replace the Rial with the Toman at a 10,000:1 ratio (dropping four zeros). As of this writing that change has been approved in principle but is not yet fully implemented in daily transactions — so the traditional 10:1 relationship is what you should use for real-world pricing today.

Because this could change, ratio is a prop/parameter everywhere rather than a hardcoded constant. If Iran's redenomination is finalized, update the ratio prop (or wrap these components in your own with a different default) rather than waiting on a package update.

Development
git clone https://github.com/your-username/react-rial-toman.git
cd react-rial-toman
npm install
npm run build   # bundles dist/index.js, dist/index.mjs, dist/index.d.ts via tsup
npm run lint     # type-check only, no emit
npm test         # run the test suite
Contributing
Issues and pull requests are welcome. If you're adding a new locale/label default, please keep the existing defaults (Latin digits, comma separator, ratio of 10) unchanged for backward compatibility.

License
MIT
