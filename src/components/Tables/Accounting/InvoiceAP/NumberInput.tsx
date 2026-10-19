import React, { useEffect, useState } from 'react';

/* ---------------------------------------------------------------------------
 * NumberInput — text input formatted with id-ID thousands separators
 * ("1.000") that also accepts a comma as the decimal separator ("0,64").
 * Always reports a plain number to `onChange`.
 * `decimals` = max fraction digits (default 2, use 0 for whole numbers).
 * ------------------------------------------------------------------------- */

const EPSILON = 1e-9;

const sanitizeNumericInput = (raw: string, decimals: number): string => {
  let out = '';
  let commaUsed = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',' && decimals > 0 && !commaUsed) {
      out += ',';
      commaUsed = true;
    }
  }
  return out;
};

const parseNumberID = (raw: string, decimals: number): number => {
  const sanitized = sanitizeNumericInput(raw, decimals);
  if (!sanitized) return 0;
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intPart = intPartRaw || '0';
  const fracPart = fracPartRaw ? fracPartRaw.slice(0, decimals) : '';
  const parsed = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const roundToPrecision = (value: number, decimals: number): number => {
  if (!value) return 0;
  const f = Math.pow(10, decimals);
  const rounded = Math.round(value * f) / f;
  if (rounded === 0 && value > 0) return 1 / f;
  if (rounded === 0 && value < 0) return -1 / f;
  return rounded;
};

const formatNumberID = (value: number, decimals: number): string => {
  if (!value) return '';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const formatTypingDisplay = (sanitized: string, decimals: number): string => {
  if (!sanitized) return '';
  const hasComma = sanitized.includes(',');
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intDigits = (intPartRaw || '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInt = Number(intDigits).toLocaleString('id-ID');
  const fracPart = hasComma ? (fracPartRaw || '').slice(0, decimals) : '';
  return hasComma ? `${groupedInt},${fracPart}` : groupedInt;
};

export type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  /** Upper bound; values typed above it are clamped */
  max?: number;
  decimals?: number;
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  max,
  decimals = 2,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToPrecision(value, decimals), decimals),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const clamp = (n: number): number => {
    const lower = Math.max(n, min);
    return max !== undefined ? Math.min(lower, max) : lower;
  };

  // Sync when the value changes from OUTSIDE, never while the user is typing.
  useEffect(() => {
    if (isFocused) return;
    const r = roundToPrecision(value, decimals);
    setDisplay(formatNumberID(r, decimals));
    if (Math.abs(r - value) > EPSILON) onChange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  return (
    <input
      type="text"
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      value={display}
      placeholder={placeholder ?? '0'}
      disabled={disabled}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = clamp(
          roundToPrecision(parseNumberID(display, decimals), decimals),
        );
        setDisplay(parsed === 0 ? '' : formatNumberID(parsed, decimals));
        onChange(parsed);
      }}
      onChange={(e) => {
        const sanitized = sanitizeNumericInput(e.target.value, decimals);
        setDisplay(formatTypingDisplay(sanitized, decimals));
        onChange(clamp(parseNumberID(sanitized, decimals)));
      }}
      className={className}
    />
  );
};

export default NumberInput;
