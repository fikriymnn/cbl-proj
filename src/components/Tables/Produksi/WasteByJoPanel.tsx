import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';

interface WasteByJoPanelProps {
  noJo: string;
  idJo: number;
}

const KATEGORI_LIST = [
  'POTONG',
  'CETAK',
  'COATING',
  'POND',
  'LEM',
  'LIPAT',
] as const;

// Sections shown inside the category detail modal.
// Data path: defectsByKategori[KATEGORI].data[key] -> [{ inspektor, wastes: [...] }]
const SECTIONS = [
  { key: 'sortir_RS', title: 'Sortir RS', dot: 'bg-blue-500' },
  { key: 'sampling_rabut', title: 'Sampling Rabut', dot: 'bg-emerald-500' },
  { key: 'ampar_lem', title: 'Ampar Lem', dot: 'bg-amber-500' },
  { key: 'helper', title: 'Temuan Helper', dot: 'bg-rose-500' },
] as const;

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '-';
  return Number(num).toLocaleString('id-ID');
};

const toTitleCase = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const getInitials = (name?: string): string =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

// All unique mesin for one waste code, taken from operator_inspektor[].mesin
// (same source used in the Rekap Waste report)
const getUniqueMesin = (defect: any): string[] => {
  const list = Array.isArray(defect?.operator_inspektor)
    ? defect.operator_inspektor
    : [];
  const set = new Set<string>();
  list.forEach((item: any) => {
    const mesin = item?.mesin ? String(item.mesin).trim() : '';
    if (mesin) set.add(mesin);
  });
  return Array.from(set);
};

const sumWastes = (entries: any[]): number =>
  entries.reduce(
    (acc, entry) =>
      acc +
      (Array.isArray(entry?.wastes)
        ? entry.wastes.reduce(
            (a: number, w: any) => a + (Number(w?.total_defect) || 0),
            0,
          )
        : 0),
    0,
  );

const WasteByJoPanel: React.FC<WasteByJoPanelProps> = ({ noJo, idJo }) => {
  const [wasteMaster, setWasteMaster] = useState<any>(null);
  const [wasteByJo, setWasteByJo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [activeKategori, setActiveKategori] = useState<string | null>(null);

  // Close the category modal with the Escape key
  useEffect(() => {
    if (!activeKategori) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveKategori(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeKategori]);

  const loadReport = async (): Promise<void> => {
    setLoading(true);
    setFailed(false);
    setWasteByJo(null);
    try {
      // Waste master is loaded on first open only, then reused
      let master = wasteMaster;
      if (!master) {
        const masterRes = await axios.get(
          `${
            import.meta.env.VITE_API_LINK
          }/master/produksi/wasteKendalaFormating`,
          {},
        );
        master = masterRes.data.waste;
        setWasteMaster(master);
      }

      const res2 = await axios.get(
        `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`,
        { params: { no_jo: noJo, id_jo: idJo } },
      );

      const res = await axios.post(
        `${import.meta.env.VITE_API_LINK}/reportWasteByJo`,
        {
          data_waste_master: master,
          data_waste_p1: res2.data,
          no_jo: noJo,
          id_jo: idJo,
        },
        { withCredentials: true },
      );

      setWasteByJo(res.data);
    } catch (error) {
      console.error('Error fetching waste by JO:', error);
      setWasteByJo(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (): void => {
    if (!show) {
      loadReport();
    }
    setShow((prev) => !prev);
  };

  const joData = wasteByJo?.dataWasteByJo?.[0] ?? wasteByJo;
  const byKategori = joData?.defectsByKategori;

  const defects: any[] = useMemo(() => {
    const list = Array.isArray(joData?.defects) ? joData.defects : [];
    return [...list].sort(
      (a: any, b: any) => (b.total_defect ?? 0) - (a.total_defect ?? 0),
    );
  }, [joData]);

  const hasData = defects.length > 0 || !!byKategori;

  const renderKategoriModal = () => {
    if (!activeKategori) return null;

    const kategoriData = byKategori?.[activeKategori];
    const kategoriTotal = kategoriData?.total_defect ?? 0;

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={() => setActiveKategori(null)}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${toTitleCase(activeKategori)} ${noJo}`}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Detail {toTitleCase(activeKategori)}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">JO {noJo}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[11px] text-gray-500">Total defect</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatNumber(kategoriTotal)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveKategori(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Tutup"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SECTIONS.map((section) => {
                const entries: any[] = Array.isArray(
                  kategoriData?.data?.[section.key],
                )
                  ? kategoriData.data[section.key]
                  : [];
                const sectionTotal = sumWastes(entries);

                return (
                  <div
                    key={section.key}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${section.dot}`}
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          {section.title}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {formatNumber(sectionTotal)} defect
                      </span>
                    </div>

                    {entries.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-400">
                        Tidak ada temuan {section.title.toLowerCase()} pada
                        proses ini.
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {entries.map((entry: any, idx: number) => {
                          const wastes: any[] = Array.isArray(entry?.wastes)
                            ? entry.wastes
                            : [];
                          return (
                            <div key={idx} className="px-4 py-3">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                                  {getInitials(entry?.inspektor)}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-xs font-medium text-gray-800">
                                    {entry?.inspektor || '-'}
                                  </div>
                                  <div className="text-[10px] text-gray-500">
                                    Inspektor
                                  </div>
                                </div>
                              </div>

                              {wastes.length === 0 ? (
                                <p className="pl-8 text-xs text-gray-400">
                                  Tidak ada waste tercatat.
                                </p>
                              ) : (
                                <table className="w-full text-xs">
                                  <tbody>
                                    {wastes.map((w: any, wi: number) => (
                                      <tr
                                        key={wi}
                                        className="border-t border-gray-100 first:border-t-0"
                                      >
                                        <td className="py-1 pr-2 text-gray-700">
                                          <span className="font-medium">
                                            {w.kode_waste}
                                          </span>
                                          {w.waste_desc
                                            ? ` - ${w.waste_desc}`
                                            : ''}
                                        </td>
                                        <td className="whitespace-nowrap py-1 text-right font-semibold text-gray-900">
                                          {formatNumber(w.total_defect)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-3">
            <button
              type="button"
              onClick={() => setActiveKategori(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <span>Waste JO {noJo}</span>
        <span className="text-xs">{show ? 'Sembunyikan ▲' : 'Lihat ▼'}</span>
      </button>

      {show && (
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : failed ? (
            <div className="py-4 text-center">
              <p className="mb-2 text-xs text-red-500">
                Gagal memuat data waste.
              </p>
              <button
                type="button"
                onClick={loadReport}
                className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Coba lagi
              </button>
            </div>
          ) : hasData ? (
            <>
              {/* Clickable category summary */}
              <div className="mb-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {KATEGORI_LIST.map((kat) => {
                  const total = byKategori?.[kat]?.total_defect ?? 0;
                  return (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setActiveKategori(kat)}
                      title={`Lihat detail ${toTitleCase(kat)}`}
                      className="rounded border border-transparent bg-gray-50 p-2 text-center transition-colors hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <div className="text-[10px] text-gray-500">{kat}</div>
                      <div
                        className={`text-sm font-semibold ${
                          total > 0 ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        {formatNumber(total)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mb-3 text-[11px] text-gray-400">
                Klik salah satu proses untuk melihat detail temuan.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-2 py-1 text-left">
                        Kode Waste
                      </th>
                      <th className="border border-gray-200 px-2 py-1 text-right">
                        Total Defect
                      </th>
                      <th className="border border-gray-200 px-2 py-1 text-left">
                        Mesin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {defects.map((d: any, idx: number) => {
                      const mesinList = getUniqueMesin(d);
                      return (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            {d.kode_waste} - {d.waste_desc}
                          </td>
                          <td className="border border-gray-200 px-2 py-1 text-right align-top">
                            {formatNumber(d.total_defect)}
                          </td>
                          <td className="border border-gray-200 px-2 py-1 align-top">
                            {mesinList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {mesinList.map((m) => (
                                  <span
                                    key={m}
                                    className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-xs text-gray-400">
              Tidak ada data waste untuk JO ini.
            </p>
          )}
        </div>
      )}

      {renderKategoriModal()}
    </div>
  );
};

export default WasteByJoPanel;
