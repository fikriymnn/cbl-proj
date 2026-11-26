import type { ReactNode } from 'react';
import { isPositiveStatus } from '../../utils/qcHelpers';

export interface TicketColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: TicketColumn<T>[]; // kolom pertama dipakai sebagai judul kartu di mobile
  getKey: (row: T) => string | number;
  onAction: (row: T) => void;
  actionLabel?: string;
  startNumber?: number;
  isLoading?: boolean;
  emptyText?: string;
}

export const StatusBadge = ({ value }: { value?: string }) => (
  <span
    className={`inline-block whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-medium text-white ${
      isPositiveStatus(value) ? 'bg-green-600' : 'bg-red-600'
    }`}
  >
    {value || '-'}
  </span>
);

function QcTicketList<T>({
  rows,
  columns,
  getKey,
  onAction,
  actionLabel = 'Detail',
  startNumber = 1,
  isLoading,
  emptyText = 'Tidak ada data.',
}: Props<T>) {
  if (!rows.length) {
    return (
      <div className="rounded-md bg-white p-6 text-center text-sm text-neutral-500 dark:bg-boxdark">
        {isLoading ? 'Memuat data...' : emptyText}
      </div>
    );
  }

  const [titleColumn, ...restColumns] = columns;
  const th = 'px-2 py-3 text-xs font-semibold text-slate-600 dark:text-white';
  const td = 'px-2 py-3 text-xs font-light text-neutral-500 dark:text-white';

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full bg-white text-left shadow-default dark:bg-boxdark">
          <thead className="border border-stroke dark:border-strokedark">
            <tr>
              <th className={`${th} w-10`}>No</th>
              {columns.map((c) => (
                <th key={c.header} className={th}>
                  {c.header}
                </th>
              ))}
              <th className={`${th} w-20 text-center`}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={getKey(row)}
                className="border border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800"
              >
                <td className={td}>{startNumber + i}</td>
                {columns.map((c) => (
                  <td key={c.header} className={`${td} break-words`}>
                    {c.render(row)}
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAction(row)}
                    className="rounded-sm bg-blue-700 px-3 py-1 text-xs font-bold text-white"
                  >
                    {actionLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 lg:hidden">
        {rows.map((row, i) => (
          <div
            key={getKey(row)}
            className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center">
                <span className="mr-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  #{startNumber + i}
                </span>
                <p className="break-all text-sm font-semibold text-gray-800 dark:text-white">
                  {titleColumn.render(row)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAction(row)}
                className="flex-shrink-0 rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white"
              >
                {actionLabel}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              {restColumns.map((c) => (
                <div key={c.header} className="flex justify-between gap-3">
                  <span className="flex-shrink-0 font-medium text-gray-600 dark:text-white">
                    {c.header}:
                  </span>
                  <span className="break-words text-right text-gray-800 dark:text-white">
                    {c.render(row)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default QcTicketList;
