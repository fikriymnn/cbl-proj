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
}

export default function SelectMarketing({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  className = '',
  zIndexBase = 10,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get display value based on current value
  const getDisplayValue = () => {
    if (isOpen) return searchTerm;

    const selectedOption = options.find((opt) => {
      // Convert both to string for comparison to handle number vs string issues
      return String(opt.value) === String(value);
    });

    return selectedOption ? selectedOption.label : '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options
  const filteredOptions = options.filter((option) => {
    if (!option || typeof option.label !== 'string') {
      return false;
    }
    const optionLabel = option.label.toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return optionLabel.includes(search);
  });

  const handleSelect = (option: Option) => {
    console.log('🔥 Selecting option:', option);
    console.log('🔥 Option value type:', typeof option.value);

    // Call onChange with the selected value
    onChange(option.value);

    // Close dropdown and clear search
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Don't clear searchTerm here, let user continue typing
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        type="text"
        value={getDisplayValue()}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ zIndex: zIndexBase + 1000 }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                onClick={() => handleSelect(option)}
                className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
              >
                {option.label}
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
