import { useState, useRef, useEffect } from 'react';

interface Option {
  value: number | string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  zIndexBase?: number;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  className = '',
  zIndexBase = 10,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setDisplayValue(selectedOption ? selectedOption.label || '' : '');
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setIsSelecting(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options with proper null/undefined handling
  const filteredOptions = options.filter((option) => {
    // Ensure option and option.label exist and are strings
    if (!option || typeof option.label !== 'string') {
      return false;
    }

    // Convert both to lowercase for case-insensitive search
    const optionLabel = option.label.toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    return optionLabel.includes(search);
  });

  const handleSelect = (option: Option) => {
    if (disabled) return;

    setIsSelecting(true);
    onChange(option.value);
    setDisplayValue(option.label || '');
    setIsOpen(false);
    setSearchTerm('');

    // Reset selecting flag after a short delay
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;

    // Don't reset if we're in the middle of selecting an option
    if (!isSelecting) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (disabled) return;

    // Prevent the click from bubbling if we're selecting
    if (isSelecting) {
      e.preventDefault();
      return;
    }
    setIsOpen(true);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none transition-all ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
            : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
        }`}
        autoComplete="off"
      />

      {isOpen && !disabled && (
        <div
          className="z-9999 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ zIndex: zIndexBase + 1000 }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onMouseDown={(e) => {
                  // Use onMouseDown instead of onClick to ensure it fires before onFocus
                  e.preventDefault();
                  handleSelect(option);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
              >
                {option.label || 'No label'}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options found
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form validation */}
      <input type="hidden" value={value} required={required} />
    </div>
  );
}
