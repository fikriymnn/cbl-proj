import type { ReactNode } from 'react';

export interface InfoItem {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'warning';
  fullWidth?: boolean;
}

const isEmpty = (v: ReactNode) =>
  v === null || v === undefined || v === '' || v === false;

const TicketInfo = ({
  items,
  columns = 2,
}: {
  items: InfoItem[];
  columns?: 1 | 2;
}) => (
  <dl
    className={`grid gap-x-6 gap-y-3 ${
      columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
    }`}
  >
    {items.map((item) => (
      <div
        key={item.label}
        className={`border-b border-gray-100 pb-2 ${
          item.fullWidth && columns === 2 ? 'sm:col-span-2' : ''
        }`}
      >
        <dt className="text-xs font-bold uppercase text-gray-700">
          {item.label}
        </dt>
        <dd
          className={`mt-0.5 break-words text-sm ${
            item.tone === 'warning'
              ? 'font-semibold text-orange-700'
              : 'text-neutral-600'
          }`}
        >
          {isEmpty(item.value) ? '-' : item.value}
        </dd>
      </div>
    ))}
  </dl>
);

export default TicketInfo;
