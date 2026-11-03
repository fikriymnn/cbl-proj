import React, { useEffect, useMemo, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Format string dari BE: "Warna 4140, bintik 3095, ..., Lolos lem ( lost glue ) 2"

export type DefectItem = { name: string; qty: number | null };

const keyOf = (d: DefectItem) => d.name.trim().toLowerCase();

export function parseDefects(raw?: string | null): DefectItem[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(.+?)\s+(\d+)$/);
      return m
        ? { name: m[1].trim(), qty: Number(m[2]) }
        : { name: part, qty: null };
    });
}

// terbesar → terkecil (item tanpa angka di paling bawah)
export function sortDefects(list: DefectItem[]): DefectItem[] {
  return [...list].sort((a, b) => (b.qty ?? -1) - (a.qty ?? -1));
}

// output sama persis dengan format yang dikirim ke BE
export function serializeDefects(list: DefectItem[]): string {
  return sortDefects(list)
    .map((d) => (d.qty == null ? d.name : `${d.name} ${d.qty}`))
    .join(', ');
}

// gabung beberapa daftar, nama yang sama hanya diambil sekali (yang pertama menang)
export function mergeDefects(...lists: DefectItem[][]): DefectItem[] {
  const seen = new Set<string>();
  const out: DefectItem[] = [];
  for (const l of lists) {
    for (const d of l) {
      const k = keyOf(d);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(d);
    }
  }
  return sortDefects(out);
}

// ─── Popup ────────────────────────────────────────────────────────────────────

export function JenisKerusakanPicker({
  options,
  value,
  onConfirm,
  onClose,
}: {
  options: DefectItem[]; // semua pilihan
  value: string; // nilai form saat ini
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const items = useMemo(() => sortDefects(options), [options]);

  // default: semua tercentang. Kalau sudah pernah dipilih, ikuti pilihan sebelumnya.
  const [checked, setChecked] = useState<Set<number>>(() => {
    const current = new Set(parseDefects(value).map(keyOf));
    if (current.size === 0) return new Set(items.map((_, i) => i));
    return new Set(
      items
        .map((d, i) => (current.has(keyOf(d)) ? i : -1))
        .filter((i) => i >= 0),
    );
  });

  const allChecked = items.length > 0 && checked.size === items.length;
  const someChecked = checked.size > 0 && !allChecked;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(items.map((_, i) => i)));

  const handleOk = () => {
    onConfirm(serializeDefects(items.filter((_, i) => checked.has(i))));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-center flex-shrink-0">
          <h3 className="text-base font-bold">Pilih Jenis Kerusakan</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <label className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50 cursor-pointer flex-shrink-0">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            disabled={items.length === 0}
            className="h-4 w-4 accent-violet-600"
          />
          <span className="text-sm font-semibold text-gray-700">
            Pilih semua
          </span>
          <span className="ml-auto text-xs text-gray-500">
            {checked.size}/{items.length} dipilih
          </span>
        </label>

        <div className="overflow-y-auto flex-1">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">
              Tidak ada jenis kerusakan.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((d, i) => (
                <li key={`${keyOf(d)}-${i}`}>
                  <label className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-violet-50">
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggle(i)}
                      className="h-4 w-4 accent-violet-600"
                    />
                    <span className="text-sm text-gray-800 flex-1">
                      {d.name}
                    </span>
                    {d.qty != null && (
                      <span className="text-sm font-bold text-red-600">
                        {d.qty.toLocaleString('id-ID')}
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleOk}
            disabled={checked.size === 0}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default JenisKerusakanPicker;
