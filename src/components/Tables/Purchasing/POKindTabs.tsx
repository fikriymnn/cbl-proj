import React from 'react';
import { POKind } from './Types/poApi';

const KIND_TABS: { value: POKind; label: string }[] = [
  { value: 'po', label: 'PO Normal' },
  { value: 'booking', label: 'PO Booking' },
];

type Props = {
  value: POKind;
  onChange: (kind: POKind) => void;
};

const POKindTabs: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex gap-1 border-b border-slate-200">
    {KIND_TABS.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
          value === t.value
            ? 'border-indigo-600 text-indigo-700'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default POKindTabs;
