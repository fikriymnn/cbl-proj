import React from 'react';
import { LKHProses, LKHWaste, WasteData, Option } from './types';
import SearchableSelect from './SearchableSelect';

interface FinishLKHModalProps {
  show: boolean;
  loading: boolean;
  finishData: LKHProses[];
  finishWasteData: LKHWaste[];
  wasteKendalaList: WasteData[];
  onClose: () => void;
  onSubmit: () => void;
  onDataChange: (
    index: number,
    field: keyof LKHProses,
    value: string | number,
  ) => void;
  onWasteDataChange: (
    index: number,
    field: keyof LKHWaste,
    value: string | number,
  ) => void;
}

const FinishLKHModal: React.FC<FinishLKHModalProps> = ({
  show,
  loading,
  finishData,
  finishWasteData,
  wasteKendalaList,
  onClose,
  onSubmit,
  onDataChange,
  onWasteDataChange,
}) => {
  if (!show) return null;

  // Sort data by latest waktu_selesai on top
  const sortedData = [...finishData].sort((a, b) => {
    const dateA = new Date(a.waktu_selesai || a.waktu_mulai).getTime();
    const dateB = new Date(b.waktu_selesai || b.waktu_mulai).getTime();
    return dateB - dateA;
  });

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;
    if (isNaN(seconds) || seconds < 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} Jam`);
    if (minutes > 0) parts.push(`${minutes} Menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} Detik`);
    return parts.join(' ');
  };

  const getWasteOptions = (): Option[] =>
    wasteKendalaList.map((waste) => ({
      value: String(waste.id),
      label: `${waste.kode} - ${waste.deskripsi}`,
    }));

  const getKendalaOptions = (wasteId: number): Option[] => {
    if (!wasteId) return [];
    const selectedWaste = wasteKendalaList.find((w) => w.id === wasteId);
    if (!selectedWaste) return [];
    return selectedWaste.kendala.map((kendala) => ({
      value: String(kendala.id),
      label: `${kendala.kode} - ${kendala.deskripsi}`,
    }));
  };

  // Group waste data by waste+kendala combo for display
  const groupedWaste = finishWasteData.reduce<{
    [key: string]: { items: LKHWaste[]; indices: number[] };
  }>((acc, item, idx) => {
    const key = `${item.id_waste}-${item.id_kendala}`;
    if (!acc[key]) acc[key] = { items: [], indices: [] };
    acc[key].items.push(item);
    acc[key].indices.push(idx);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Review Data Proses Selesai
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Periksa dan edit data sebelum menyelesaikan LKH
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {finishData.length === 0 && finishWasteData.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-3 text-gray-500 text-sm">
                Tidak ada data proses selesai
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Regular Process Data */}
              {finishData.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    Data Proses Produksi
                  </h4>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-green-50">
                          <tr>
                            {[
                              'Kode',
                              'Deskripsi',
                              'Waktu Mulai',
                              'Waktu Selesai',
                              'Durasi',
                              'Baik',
                              'Rusak Sebagian',
                              'Rusak Total',
                              'Pallet',
                              'Catatan',
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2.5 text-left font-semibold text-green-800 uppercase tracking-wide whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {sortedData.map((item) => {
                            const originalIndex = finishData.findIndex(
                              (original) => original.id === item.id,
                            );
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-gray-100 text-gray-700">
                                    {item.kode}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-800 max-w-[150px] truncate">
                                  {item.deskripsi}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                                  {formatDateTime(item.waktu_mulai)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                                  {formatDateTime(item.waktu_selesai || '')}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-700 font-medium">
                                  {formatDuration(item.total_waktu || '0')}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={item.baik || ''}
                                    onChange={(e) =>
                                      onDataChange(
                                        originalIndex,
                                        'baik',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0,
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={item.rusak_sebagian || ''}
                                    onChange={(e) =>
                                      onDataChange(
                                        originalIndex,
                                        'rusak_sebagian',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0,
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={item.rusak_total || ''}
                                    onChange={(e) =>
                                      onDataChange(
                                        originalIndex,
                                        'rusak_total',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0,
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={item.pallet || ''}
                                    onChange={(e) =>
                                      onDataChange(
                                        originalIndex,
                                        'pallet',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : 0,
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={item.note || ''}
                                    onChange={(e) =>
                                      onDataChange(
                                        originalIndex,
                                        'note',
                                        e.target.value,
                                      )
                                    }
                                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Catatan"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Waste Data */}
              {finishWasteData.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Data Waste
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      ({finishWasteData.length} Waste)
                    </span>
                  </h4>

                  {/* Grouped View */}
                  <div className="space-y-3">
                    {Object.entries(groupedWaste).map(([key, group]) => {
                      const firstItem = group.items[0];
                      const wasteOptions = getWasteOptions();
                      const kendalaOptions = getKendalaOptions(
                        firstItem.id_waste,
                      );
                      const totalQty = group.items.reduce(
                        (s, i) => s + (i.total_qty || 0),
                        0,
                      );

                      return (
                        <div
                          key={key}
                          className="border border-amber-200 rounded-lg overflow-hidden"
                        >
                          {/* Group Header */}
                          <div className="bg-amber-50 px-4 py-2.5 flex items-center justify-between border-b border-amber-200">
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="text-xs font-semibold text-amber-800">
                                  {firstItem.kode_waste} —{' '}
                                  {firstItem.deskripsi_waste}
                                </span>
                                <span className="text-amber-500 mx-2">·</span>
                                <span className="text-xs text-amber-700">
                                  {firstItem.kode_kendala} —{' '}
                                  {firstItem.deskripsi_kendala}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                              Total: {totalQty}
                            </span>
                          </div>

                          {/* Per-operator rows */}
                          <div className="divide-y divide-gray-100 bg-white">
                            {group.items.map((item, groupItemIdx) => {
                              const originalIndex = group.indices[groupItemIdx];
                              const itemWasteOptions = getWasteOptions();
                              const itemKendalaOptions = getKendalaOptions(
                                item.id_waste,
                              );

                              return (
                                <div key={originalIndex} className="px-4 py-3">
                                  <div className="grid grid-cols-3 gap-3 items-end">
                                    {/* Waste Select */}
                                    <div>
                                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                        Waste
                                      </label>
                                      <SearchableSelect
                                        options={itemWasteOptions}
                                        value={
                                          item.id_waste
                                            ? String(item.id_waste)
                                            : null
                                        }
                                        onChange={(val) =>
                                          onWasteDataChange(
                                            originalIndex,
                                            'id_waste',
                                            Number(val),
                                          )
                                        }
                                        placeholder="Pilih Waste"
                                      />
                                    </div>

                                    {/* Kendala Select */}
                                    <div>
                                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                        Kendala
                                      </label>
                                      <SearchableSelect
                                        options={itemKendalaOptions}
                                        value={
                                          item.id_kendala
                                            ? String(item.id_kendala)
                                            : null
                                        }
                                        onChange={(val) =>
                                          onWasteDataChange(
                                            originalIndex,
                                            'id_kendala',
                                            Number(val),
                                          )
                                        }
                                        placeholder="Pilih Kendala"
                                        disabled={!item.id_waste}
                                      />
                                    </div>

                                    {/* Qty + Operator info */}
                                    <div className="flex items-end gap-2">
                                      <div className="flex-1">
                                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                          Qty
                                        </label>
                                        <input
                                          type="number"
                                          value={item.total_qty || ''}
                                          onChange={(e) =>
                                            onWasteDataChange(
                                              originalIndex,
                                              'total_qty',
                                              e.target.value
                                                ? Number(e.target.value)
                                                : 0,
                                            )
                                          }
                                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="0"
                                          min="0"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Operator badge */}
                                  {(item as any).operator && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                      <svg
                                        className="w-3 h-3 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                      <span className="text-[10px] text-gray-500">
                                        Operator:{' '}
                                        <span className="font-semibold text-gray-700">
                                          {(item as any).operator?.nama ||
                                            `ID: ${item.id_operator}`}
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {finishData.length > 0 && (
              <span>{finishData.length} proses · </span>
            )}
            {finishWasteData.length > 0 && (
              <span>{finishWasteData.length} waste</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={onSubmit}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={
                loading ||
                (finishData.length === 0 && finishWasteData.length === 0)
              }
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Selesaikan LKH'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishLKHModal;
