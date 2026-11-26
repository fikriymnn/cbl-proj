import type { ReactNode } from 'react';
import type { HistoryFilters } from '../../utils/qcHelpers';

interface Props {
  filters: HistoryFilters;
  onChange: (patch: Partial<HistoryFilters>) => void;
  machines: any[];
  statusLabel: string;
  statusOptions: { value: string; label: string }[];
  searchPlaceholder: string;
  error?: string;
  isExporting: boolean;
  onSubmit: () => void;
  onReset: () => void;
  onExport: () => void;
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2 md:col-span-1 xl:col-span-2">
    <p className="text-sm font-semibold text-primary">{label}</p>
    {children}
  </div>
);

const QcHistoryFilters = ({
  filters,
  onChange,
  machines,
  statusLabel,
  statusOptions,
  searchPlaceholder,
  error,
  isExporting,
  onSubmit,
  onReset,
  onExport,
}: Props) => (
  <div className="bg-white px-4 py-2">
    <div className="grid w-full grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12">
      <Field label="Dari:">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          className="h-8 w-full rounded-full bg-[#D8EAFF] px-2"
        />
      </Field>
      <Field label="Sampai:">
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
          className="h-8 w-full rounded-full bg-[#D8EAFF] px-2"
        />
      </Field>
      <Field label="Pilih Mesin:">
        <select
          value={filters.mesin}
          onChange={(e) => onChange({ mesin: e.target.value })}
          className="h-8 w-full rounded-md bg-blue-200"
        >
          <option value="">Semua Mesin</option>
          {machines.map((m: any, i: number) => (
            <option key={i} value={m.nama_mesin}>
              {m.nama_mesin}
            </option>
          ))}
        </select>
      </Field>
      <Field label={statusLabel}>
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="h-8 w-full rounded-md bg-blue-200"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cari">
        <input
          type="text"
          value={filters.search}
          placeholder={searchPlaceholder}
          onChange={(e) => onChange({ search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="h-8 w-full rounded-md bg-[#D8EAFF] px-2"
        />
      </Field>
      <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1 xl:col-span-2">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-md bg-primary px-5 py-2 text-white"
        >
          Tampilkan
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 rounded-md bg-green-500 px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {isExporting ? 'Loading...' : 'EXPORT'}
          </button>
        </div>
      </div>
    </div>
    {error && (
      <p role="alert" className="mt-2 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default QcHistoryFilters;
