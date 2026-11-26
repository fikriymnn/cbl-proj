import { useEffect } from 'react';

export const useEscapeKey = (onEscape: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape, enabled]);
};

export const CloseButton = ({
  onClick,
  size = 22,
}: {
  onClick: () => void;
  size?: number;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Tutup"
    className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
  >
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#0065DE" />
      <path
        d="M7 7l8 8M15 7l-8 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </button>
);
