import React, { useEffect, type ReactNode } from 'react';

/**
 * Shared modal (replaces ModalFull / ModalXL for the updated screens).
 *
 * size:
 *  - md     : confirm / small forms
 *  - lg, xl : content modals
 *  - screen : takes (almost) the whole viewport, for workspaces such as the
 *             drag & drop schedule editor. Use together with `flush` so the
 *             children can manage their own scrolling.
 */
export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'screen';
  /** Render above another modal */
  stacked?: boolean;
  /** No body padding / scroll: children fill the available height */
  flush?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const AppModal = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  stacked = false,
  flush = false,
  footer,
  children,
}: AppModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const box =
    size === 'screen'
      ? 'h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)]'
      : `max-h-[90vh] w-full ${
          size === 'xl' ? 'max-w-6xl' : size === 'lg' ? 'max-w-4xl' : 'max-w-md'
        }`;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 ${
        size === 'screen' ? 'p-3' : 'p-4'
      } ${stacked ? 'z-[60]' : 'z-50'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex flex-col rounded-2xl bg-white shadow-2xl ${box}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#D8EAFF] px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <div className="mt-0.5 text-sm text-slate-600">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 ${
            flush ? 'overflow-hidden p-4' : 'overflow-y-auto px-6 py-4'
          }`}
        >
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#D8EAFF] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppModal;
