// First, install react-dom if not already installed
// npm install react-dom

// Update SearchableSelect.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  style?: React.CSSProperties; // Add this
  onFocus?: () => void; // Add this
  onBlur?: () => void; // Add this
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  className = '',
  style, // Add this
  onFocus, // Add this
  onBlur, // Add this
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setDisplayValue(selectedOption ? selectedOption.label || '' : '');
  }, [value, options]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      setDropdownPosition({
        top: rect.bottom + scrollY,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setIsSelecting(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  // Filter options with proper null/undefined handling
  const filteredOptions = options.filter((option) => {
    if (!option || typeof option.label !== 'string') {
      return false;
    }
    const optionLabel = option.label.toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return optionLabel.includes(search);
  });

  const handleSelect = (option: Option) => {
    setIsSelecting(true);
    onChange(option.value);
    setDisplayValue(option.label || '');
    setIsOpen(false);
    setSearchTerm('');

    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
      updateDropdownPosition();
    }
  };

  const handleInputFocus = () => {
    if (!isSelecting) {
      setIsOpen(true);
      setSearchTerm('');
    }
    onFocus?.(); // Call the prop function if provided
  };

  const handleInputBlur = () => {
    onBlur?.(); // Call the prop function if provided
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (isSelecting) {
      e.preventDefault();
      return;
    }
    setIsOpen(true);
    updateDropdownPosition();
    setSearchTerm('');
  };

  // Render dropdown content
  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option) => (
          <div
            key={option.value}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(option);
            }}
            className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
          >
            {option.label || 'No label'}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
      )}
    </div>
  ) : null;

  return (
    <div className={`relative ${className} z-99999`}>
      <input
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onClick={handleInputClick}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
