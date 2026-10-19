import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** When set, a first "all / none" option with value '' is shown */
  allLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Searchable replacement for <select>. Works with touch (tap to open, tap an
 * option) and keyboard (arrows / enter / escape).
 */
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  allLabel,
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ada hasil',
  disabled,
  loading,
  className = '',
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [active, setActive] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const items = useMemo<SelectOption[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    return allLabel && !q
      ? [{ value: '', label: allLabel }, ...filtered]
      : filtered;
  }, [options, query, allLabel]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    if (found) return found.label;
    if (value === '' && allLabel) return allLabel;
    return '';
  }, [options, value, allLabel]);

  // Close on outside tap / click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  // Reset search + highlight the current value every time it opens
  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const idx = items.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted row visible
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (opt: SelectOption): void => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[active]) choose(items[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <span
          className={`truncate ${
            selectedLabel ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {selectedLabel || (loading ? 'Memuat...' : placeholder)}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[12rem] bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-auto py-1"
          >
            {items.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">{emptyText}</li>
            ) : (
              items.map((opt, i) => (
                <li
                  key={`${opt.value}-${i}`}
                  role="option"
                  aria-selected={opt.value === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    i === active ? 'bg-blue-50' : ''
                  } ${
                    opt.value === value
                      ? 'font-semibold text-blue-700'
                      : 'text-gray-800'
                  }`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
