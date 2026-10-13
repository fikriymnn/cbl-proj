import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// NumberInput — dipindah apa adanya dari CreatePOModal / EditPOModal supaya
// bisa dipakai file baru (POBookingFormModal). Logikanya IDENTIK dengan versi
// inline di kedua modal itu. Kalau mau, di CreatePOModal & EditPOModal blok
// NumberInput + helper-nya (EPSILON ... NumberInput) boleh dihapus dan diganti
// `import NumberInput from './NumberInput';`.
// ---------------------------------------------------------------------------

const EPSILON = 1e-9;

const formatNumberID = (value: number): string => {
  if (!value) return '';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const sanitizeNumericInput = (raw: string): string => {
  let out = '';
  let commaUsed = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',' && !commaUsed) {
      out += ',';
      commaUsed = true;
    }
  }
  return out;
};

const formatTypingDisplay = (sanitized: string): string => {
  if (!sanitized) return '';
  const hasComma = sanitized.includes(',');
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intDigits = (intPartRaw || '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInt = Number(intDigits).toLocaleString('id-ID');
  const fracPart = hasComma ? (fracPartRaw || '').slice(0, 2) : '';
  return hasComma ? `${groupedInt},${fracPart}` : groupedInt;
};

const parseNumberID = (raw: string): number => {
  const sanitized = sanitizeNumericInput(raw);
  if (!sanitized) return 0;
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intPart = intPartRaw || '0';
  const fracPart = fracPartRaw ? fracPartRaw.slice(0, 2) : '';
  const parsed = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const roundToSupportedPrecision = (value: number): number => {
  if (!value) return 0;
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0 && value > 0) return 0.01;
  if (rounded === 0 && value < 0) return -0.01;
  return rounded;
};

export type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToSupportedPrecision(value)),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const rounded = roundToSupportedPrecision(value);
  const wasRounded = !isFocused && Math.abs(rounded - value) > EPSILON;

  useEffect(() => {
    if (isFocused) return;
    const r = roundToSupportedPrecision(value);
    setDisplay(formatNumberID(r));
    if (Math.abs(r - value) > EPSILON) {
      onChange(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  return (
    <div className="w-full">
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder ?? '0'}
        disabled={disabled}
        title={
          wasRounded
            ? `Nilai asli: ${value.toLocaleString('id-ID', {
                maximumFractionDigits: 6,
              })} — dibulatkan ke 0,01`
            : undefined
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          const parsed = Math.max(
            roundToSupportedPrecision(parseNumberID(display)),
            min,
          );
          setDisplay(parsed === 0 ? '' : formatNumberID(parsed));
          onChange(parsed);
        }}
        onChange={(e) => {
          const sanitized = sanitizeNumericInput(e.target.value);
          setDisplay(formatTypingDisplay(sanitized));
          onChange(Math.max(parseNumberID(sanitized), min));
        }}
        className={className}
      />
      {wasRounded && (
        <span className="block text-[10px] text-amber-600 mt-0.5 whitespace-nowrap">
          *asli {value.toLocaleString('id-ID', { maximumFractionDigits: 6 })},
          dibulatkan
        </span>
      )}
    </div>
  );
};

export default NumberInput;
