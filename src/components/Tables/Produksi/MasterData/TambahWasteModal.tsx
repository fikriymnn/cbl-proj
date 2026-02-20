import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_LINK;

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface KodeProduksi {
  id: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  id_tahapan_produksi: number;
}

interface Kendala {
  id: number;
  id_tahapan_produksi: number;
  id_waste_kendala: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  status: 'new' | 'update' | 'delete';
}

interface WasteData {
  id: number;
  id_tahapan_produksi: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  status: 'new' | 'update' | 'delete';
  kendala: Kendala[];
}

interface TambahWasteModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Custom select styles — compact, no dropdown clipping issues
const selectStyles = (isWarning = false) => ({
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '32px',
    height: '32px',
    fontSize: '13px',
    borderRadius: '6px',
    border: isWarning
      ? '1.5px solid #f59e0b'
      : state.isFocused
      ? '1.5px solid #3c50e0'
      : '1.5px solid #e2e8f0',
    boxShadow: 'none',
    backgroundColor: isWarning ? '#fffbeb' : '#fff',
    '&:hover': { borderColor: isWarning ? '#f59e0b' : '#3c50e0' },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 8px',
    height: '32px',
  }),
  indicatorsContainer: (base: any) => ({ ...base, height: '32px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({ ...base, padding: '4px' }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
    fontSize: '13px',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3c50e0'
      : state.isFocused
      ? '#eff2ff'
      : '#fff',
    color: state.isSelected ? '#fff' : '#1a202c',
    padding: '8px 12px',
  }),
  singleValue: (base: any) => ({ ...base, color: '#1a202c' }),
  placeholder: (base: any) => ({ ...base, color: '#94a3b8', fontSize: '13px' }),
});

const TambahWasteModal: React.FC<TambahWasteModalProps> = ({
  show,
  onClose,
  onSuccess,
}) => {
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [selectedTahapan, setSelectedTahapan] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [kodeProduksiOptions, setKodeProduksiOptions] = useState<
    KodeProduksi[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingTahapan, setLoadingTahapan] = useState(false);

  useEffect(() => {
    if (show) {
      fetchTahapan();
    } else {
      setSelectedTahapan(null);
      setWasteData([]);
      setKodeProduksiOptions([]);
    }
  }, [show]);

  useEffect(() => {
    if (selectedTahapan) {
      fetchWasteKendalaData();
      fetchKodeProduksiOptions();
    }
  }, [selectedTahapan]);

  const fetchTahapan = async () => {
    setLoadingTahapan(true);
    try {
      const response = await axios.get(`${API_BASE}/master/tahapan`);
      setTahapanList(response.data.data || []);
    } catch {
      alert('Gagal memuat data tahapan');
    } finally {
      setLoadingTahapan(false);
    }
  };

  const fetchWasteKendalaData = async () => {
    if (!selectedTahapan) return;
    setLoadingData(true);
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/wasteKendala`,
        {
          params: { id_tahapan_produksi: selectedTahapan.value },
        },
      );
      const fetchedData = response.data.data || [];
      const dataWithStatus = fetchedData.map((waste: any) => ({
        ...waste,
        status: 'update',
        kendala:
          waste.kendala?.map((k: any) => ({ ...k, status: 'update' })) || [],
      }));
      setWasteData(dataWithStatus);
    } catch {
      setWasteData([]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchKodeProduksiOptions = async () => {
    if (!selectedTahapan) return;
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/kodeProduksi`,
        {
          params: { id_tahapan_produksi: selectedTahapan.value, limit: 1000 },
        },
      );
      setKodeProduksiOptions(response.data.data || []);
    } catch {
      /* silent */
    }
  };

  const getWasteOptions = () =>
    kodeProduksiOptions.filter((kp) => /^[A-Z]/.test(kp.kode));
  const getKendalaOptions = () =>
    kodeProduksiOptions.filter((kp) => /^\d/.test(kp.kode));

  // IDs of waste already selected (to show warning)
  const selectedWasteIds = wasteData
    .filter((w) => w.status !== 'delete' && w.kode)
    .map((w) => w.id);

  const handleAddWaste = () => {
    const newWaste: WasteData = {
      id: Date.now(),
      id_tahapan_produksi: selectedTahapan!.value,
      proses_produksi: 'Waste',
      kode: '',
      deskripsi: '',
      status: 'new',
      kendala: [],
    };
    setWasteData([...wasteData, newWaste]);
  };

  const handleAddKendala = (wasteIndex: number) => {
    const updatedData = [...wasteData];
    const newKendala: Kendala = {
      id: Date.now(),
      id_tahapan_produksi: selectedTahapan!.value,
      id_waste_kendala: updatedData[wasteIndex].id,
      proses_produksi: 'Kendala',
      kode: '',
      deskripsi: '',
      status: 'new',
    };
    updatedData[wasteIndex].kendala.push(newKendala);
    if (updatedData[wasteIndex].status !== 'new')
      updatedData[wasteIndex].status = 'update';
    setWasteData(updatedData);
  };

  const handleDeleteKendala = (wasteIndex: number, kendalaIndex: number) => {
    const updatedData = [...wasteData];
    if (updatedData[wasteIndex].kendala[kendalaIndex].status === 'new') {
      updatedData[wasteIndex].kendala.splice(kendalaIndex, 1);
    } else {
      updatedData[wasteIndex].kendala[kendalaIndex].status = 'delete';
    }
    if (updatedData[wasteIndex].status !== 'new')
      updatedData[wasteIndex].status = 'update';
    setWasteData(updatedData);
  };

  const handleWasteSelect = (wasteIndex: number, selectedOption: any) => {
    if (!selectedOption) return;
    const updatedData = [...wasteData];
    const newWasteId = selectedOption.value;
    updatedData[wasteIndex] = {
      ...updatedData[wasteIndex],
      id: newWasteId,
      kode: selectedOption.kode,
      deskripsi: selectedOption.deskripsi,
    };
    updatedData[wasteIndex].kendala = updatedData[wasteIndex].kendala.map(
      (k) => ({
        ...k,
        id_waste_kendala: newWasteId,
      }),
    );
    setWasteData(updatedData);
  };

  const handleKendalaSelect = (
    wasteIndex: number,
    kendalaIndex: number,
    selectedOption: any,
  ) => {
    if (!selectedOption) return;
    const updatedData = [...wasteData];
    updatedData[wasteIndex].kendala[kendalaIndex] = {
      ...updatedData[wasteIndex].kendala[kendalaIndex],
      id: selectedOption.value,
      id_waste_kendala: updatedData[wasteIndex].id,
      kode: selectedOption.kode,
      deskripsi: selectedOption.deskripsi,
    };
    if (updatedData[wasteIndex].kendala[kendalaIndex].status !== 'new') {
      updatedData[wasteIndex].kendala[kendalaIndex].status = 'update';
    }
    setWasteData(updatedData);
  };

  const handleSubmit = async () => {
    if (!selectedTahapan) {
      alert('Silakan pilih tahapan produksi terlebih dahulu');
      return;
    }
    const invalidWaste = wasteData.find(
      (w) => w.status !== 'delete' && !w.kode.trim(),
    );
    if (invalidWaste) {
      alert('Semua waste harus memiliki kode');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        data: wasteData.map((waste) => ({
          id: waste.id,
          id_tahapan_produksi: waste.id_tahapan_produksi,
          proses_produksi: waste.proses_produksi,
          kode: waste.kode,
          deskripsi: waste.deskripsi,
          status: waste.status,
          kendala: waste.kendala.map((k) => ({
            id: k.id,
            id_tahapan_produksi: k.id_tahapan_produksi,
            id_waste_kendala: k.id_waste_kendala,
            proses_produksi: k.proses_produksi,
            kode: k.kode,
            deskripsi: k.deskripsi,
            status: k.status,
          })),
        })),
      };
      await axios.put(`${API_BASE}/master/produksi/wasteKendala`, payload);
      alert('Data berhasil disimpan');
      onSuccess();
      handleClose();
    } catch {
      alert('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTahapan(null);
    setWasteData([]);
    setKodeProduksiOptions([]);
    onClose();
  };

  if (!show) return null;

  const activeWaste = wasteData.filter((w) => w.status !== 'delete');

  // Build flat rows for the table: waste row + its kendala rows
  type TableRow =
    | {
        type: 'waste';
        waste: WasteData;
        wasteIndex: number;
        isAlreadySelected: boolean;
      }
    | {
        type: 'kendala';
        kendala: Kendala;
        wasteIndex: number;
        kendalaIndex: number;
        wasteName: string;
      };

  const rows: TableRow[] = [];
  activeWaste.forEach((waste) => {
    const wasteIndex = wasteData.indexOf(waste);
    // Count how many times this waste.id appears (duplicate warning)
    const occurrences = activeWaste.filter(
      (w) => w.id === waste.id && w.kode,
    ).length;
    const isAlreadySelected = waste.kode !== '' && occurrences > 1;

    rows.push({ type: 'waste', waste, wasteIndex, isAlreadySelected });

    waste.kendala
      .filter((k) => k.status !== 'delete')
      .forEach((kendala) => {
        const kendalaIndex = waste.kendala.indexOf(kendala);
        rows.push({
          type: 'kendala',
          kendala,
          wasteIndex,
          kendalaIndex,
          wasteName: waste.kode
            ? `${waste.kode} - ${waste.deskripsi}`
            : '(Waste belum dipilih)',
        });
      });
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="flex flex-col w-full max-w-6xl rounded-xl bg-white dark:bg-boxdark shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark flex-shrink-0">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Set Master Waste Cetak
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-meta-1 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Tahapan selector ── */}
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark flex-shrink-0">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-black dark:text-white whitespace-nowrap">
              Tahapan Produksi <span className="text-meta-1">*</span>
            </label>
            <div className="flex-1 max-w-sm">
              {loadingTahapan ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Memuat...
                </div>
              ) : (
                <Select
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  options={tahapanList.map((t) => ({
                    value: t.id,
                    label: `${t.kode_tahapan} - ${t.nama_tahapan}`,
                  }))}
                  value={selectedTahapan}
                  onChange={(sel) => {
                    setSelectedTahapan(sel);
                    setWasteData([]);
                  }}
                  placeholder="Pilih Tahapan"
                  styles={selectStyles()}
                  isClearable
                />
              )}
            </div>
            {selectedTahapan && (
              <button
                onClick={handleAddWaste}
                className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
              >
                <FaPlus size={12} /> Tambah Waste
              </button>
            )}
          </div>
        </div>

        {/* ── Table body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!selectedTahapan ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Pilih tahapan produksi untuk melihat data
            </div>
          ) : loadingData ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stroke text-sm text-gray-400">
              <span>Belum ada data.</span>
              <button
                onClick={handleAddWaste}
                className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90"
              >
                <FaPlus size={10} /> Tambah Waste
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-meta-4 text-left">
                  <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 border border-stroke dark:border-strokedark w-24">
                    Tipe
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 border border-stroke dark:border-strokedark">
                    Kode &amp; Deskripsi
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 border border-stroke dark:border-strokedark w-36 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  if (row.type === 'waste') {
                    const { waste, wasteIndex, isAlreadySelected } = row;
                    return (
                      <React.Fragment key={`waste-${wasteIndex}`}>
                        <tr className="bg-blue-50 dark:bg-meta-4/60">
                          <td className="px-3 py-2 border border-stroke dark:border-strokedark">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                                Waste
                              </span>
                              {waste.status === 'new' && (
                                <span className="text-xs text-meta-3 font-medium">
                                  Baru
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 border border-stroke dark:border-strokedark">
                            <div className="flex flex-col gap-1">
                              <Select
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                options={getWasteOptions().map((kp) => ({
                                  value: kp.id,
                                  label: `${kp.kode} - ${kp.deskripsi}`,
                                  kode: kp.kode,
                                  deskripsi: kp.deskripsi,
                                }))}
                                value={
                                  waste.kode
                                    ? {
                                        value: waste.id,
                                        label: `${waste.kode} - ${waste.deskripsi}`,
                                      }
                                    : null
                                }
                                onChange={(sel) =>
                                  handleWasteSelect(wasteIndex, sel)
                                }
                                placeholder="Pilih Waste..."
                                styles={selectStyles(isAlreadySelected)}
                              />
                              {isAlreadySelected && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                  <FaExclamationTriangle size={10} />
                                  Waste ini sudah dipilih pada baris lain
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 border border-stroke dark:border-strokedark text-center">
                            <button
                              onClick={() => handleAddKendala(wasteIndex)}
                              className="inline-flex items-center gap-1 rounded bg-success px-2.5 py-1 text-xs font-medium text-white hover:bg-opacity-90"
                              title="Tambah Kendala"
                            >
                              <FaPlus size={9} /> Kendala
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  } else {
                    const { kendala, wasteIndex, kendalaIndex } = row;
                    return (
                      <tr
                        key={`kendala-${wasteIndex}-${kendalaIndex}`}
                        className="bg-white dark:bg-boxdark"
                      >
                        <td className="px-3 py-2 border border-stroke dark:border-strokedark">
                          <div className="flex items-center gap-2 pl-4">
                            <span className="text-gray-300 dark:text-gray-600">
                              └
                            </span>
                            <span className="inline-block rounded bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning">
                              Kendala
                            </span>
                            {kendala.status === 'new' && (
                              <span className="text-xs text-meta-3 font-medium">
                                Baru
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 border border-stroke dark:border-strokedark pl-8">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            options={getKendalaOptions().map((kp) => ({
                              value: kp.id,
                              label: `${kp.kode} - ${kp.deskripsi}`,
                              kode: kp.kode,
                              deskripsi: kp.deskripsi,
                            }))}
                            value={
                              kendala.kode
                                ? {
                                    value: kendala.id,
                                    label: `${kendala.kode} - ${kendala.deskripsi}`,
                                  }
                                : null
                            }
                            onChange={(sel) =>
                              handleKendalaSelect(wasteIndex, kendalaIndex, sel)
                            }
                            placeholder="Pilih Kendala..."
                            styles={selectStyles()}
                          />
                        </td>
                        <td className="px-3 py-2 border border-stroke dark:border-strokedark text-center">
                          <button
                            onClick={() =>
                              handleDeleteKendala(wasteIndex, kendalaIndex)
                            }
                            className="inline-flex items-center justify-center rounded bg-meta-1 p-1.5 text-white hover:bg-opacity-90"
                            title="Hapus Kendala"
                          >
                            <FaTrash size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        {selectedTahapan && (
          <div className="flex gap-3 px-6 py-4 border-t border-stroke dark:border-strokedark flex-shrink-0">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded border border-stroke px-4 py-2 text-sm font-medium hover:shadow-1 dark:border-strokedark disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || loadingData || !selectedTahapan}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <FaSave />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TambahWasteModal;
