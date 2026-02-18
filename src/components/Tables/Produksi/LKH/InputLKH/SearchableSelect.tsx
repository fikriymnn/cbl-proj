import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSearchable?: boolean;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  onClear,
  placeholder = 'Pilih...',
  disabled = false,
  isSearchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({
    top: 0,
    left: 0,
    width: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < dropdownHeight && rect.top > dropdownHeight
        ? rect.top - dropdownHeight
        : rect.bottom + 2;
    setDropdownPos({ top, left: rect.left, width: rect.width });
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    computePosition();
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      closeDropdown();
    };
    const handleScrollResize = () => computePosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen, computePosition]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    closeDropdown();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear ? onClear() : onChange('');
    closeDropdown();
  };

  const dropdown =
    isOpen && !disabled
      ? ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
          >
            {isSearchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto max-h-52">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${
                      value === option.value
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">
                  Tidak ada data
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        className={`w-full px-2.5 py-1.5 text-xs rounded border bg-white flex items-center justify-between transition-colors
          ${
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
              : 'cursor-pointer border-gray-300 hover:border-blue-400'
          }
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedOption && !disabled && (
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              type="button"
            >
              <X size={12} className="text-gray-400" />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
      {dropdown}
    </div>
  );
};

export default SearchableSelect;
