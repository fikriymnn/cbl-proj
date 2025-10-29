import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

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

  // Fetch tahapan when modal opens
  useEffect(() => {
    if (show) {
      console.log('Modal opened, fetching tahapan...');
      fetchTahapan();
    } else {
      // Reset when modal closes
      setSelectedTahapan(null);
      setWasteData([]);
      setKodeProduksiOptions([]);
    }
  }, [show]);

  useEffect(() => {
    if (selectedTahapan) {
      console.log('Tahapan selected:', selectedTahapan);
      fetchWasteKendalaData();
      fetchKodeProduksiOptions();
    }
  }, [selectedTahapan]);

  const fetchTahapan = async () => {
    setLoadingTahapan(true);
    try {
      console.log('Fetching tahapan from:', `${API_BASE}/master/tahapan`);
      const response = await axios.get(`${API_BASE}/master/tahapan`);
      console.log('Tahapan response:', response.data);
      setTahapanList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tahapan:', error);
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
      console.log('Waste Kendala response:', response.data);
      const fetchedData = response.data.data || [];
      const dataWithStatus = fetchedData.map((waste: any) => ({
        ...waste,
        status: 'update',
        kendala:
          waste.kendala?.map((k: any) => ({
            ...k,
            status: 'update',
          })) || [],
      }));

      setWasteData(dataWithStatus);
    } catch (error) {
      console.error('Error fetching waste kendala data:', error);
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
          params: {
            id_tahapan_produksi: selectedTahapan.value,
            limit: 1000,
          },
        },
      );
      setKodeProduksiOptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching kode produksi options:', error);
    }
  };

  const getWasteOptions = () => {
    return kodeProduksiOptions.filter((kp) => /^[A-Z]/.test(kp.kode));
  };

  const getKendalaOptions = () => {
    return kodeProduksiOptions.filter((kp) => /^\d/.test(kp.kode));
  };

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

    if (updatedData[wasteIndex].status !== 'new') {
      updatedData[wasteIndex].status = 'update';
    }

    setWasteData(updatedData);
  };

  //   const handleDeleteWaste = (wasteIndex: number) => {
  //     const updatedData = [...wasteData];
  //     if (updatedData[wasteIndex].status === 'new') {
  //       updatedData.splice(wasteIndex, 1);
  //     } else {
  //       updatedData[wasteIndex].status = 'delete';
  //     }
  //     setWasteData(updatedData);
  //   };

  const handleDeleteKendala = (wasteIndex: number, kendalaIndex: number) => {
    const updatedData = [...wasteData];
    if (updatedData[wasteIndex].kendala[kendalaIndex].status === 'new') {
      updatedData[wasteIndex].kendala.splice(kendalaIndex, 1);
    } else {
      updatedData[wasteIndex].kendala[kendalaIndex].status = 'delete';
    }

    if (updatedData[wasteIndex].status !== 'new') {
      updatedData[wasteIndex].status = 'update';
    }

    setWasteData(updatedData);
  };

  const handleWasteSelect = (wasteIndex: number, selectedOption: any) => {
    if (selectedOption) {
      const updatedData = [...wasteData];
      const oldWasteId = updatedData[wasteIndex].id;
      const newWasteId = selectedOption.value;

      updatedData[wasteIndex] = {
        ...updatedData[wasteIndex],
        id: newWasteId,
        kode: selectedOption.kode,
        deskripsi: selectedOption.deskripsi,
      };

      // Update id_waste_kendala for all kendala under this waste
      updatedData[wasteIndex].kendala = updatedData[wasteIndex].kendala.map(
        (k) => ({
          ...k,
          id_waste_kendala: newWasteId,
        }),
      );

      setWasteData(updatedData);
    }
  };

  const handleKendalaSelect = (
    wasteIndex: number,
    kendalaIndex: number,
    selectedOption: any,
  ) => {
    if (selectedOption) {
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
    }
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
      console.log('Submitting payload:', payload);
      await axios.put(`${API_BASE}/master/produksi/wasteKendala`, payload);
      alert('Data berhasil disimpan');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving data:', error);
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="my-8 w-full max-w-7xl rounded-lg bg-white p-6 dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Set Master Waste Cetak
          </h3>
          <button
            onClick={handleClose}
            className="text-3xl text-black hover:text-primary dark:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tahapan Selector */}
        <div className="mb-6">
          <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
            Pilih Tahapan Produksi <span className="text-meta-1">*</span>
          </label>
          {loadingTahapan ? (
            <div className="flex h-12 items-center justify-center rounded border border-stroke">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Select
              options={tahapanList.map((tahapan) => ({
                value: tahapan.id,
                label: `${tahapan.kode_tahapan} - ${tahapan.nama_tahapan}`,
              }))}
              value={selectedTahapan}
              onChange={(selected) => {
                setSelectedTahapan(selected);
                setWasteData([]);
              }}
              placeholder="Pilih Tahapan"
              className="basic-single"
              classNamePrefix="select"
              isClearable
            />
          )}
        </div>

        {/* Data Section */}
        {selectedTahapan && (
          <>
            {loadingData ? (
              <div className="flex h-60 items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Add Waste Button */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleAddWaste}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                  >
                    <FaPlus /> Tambah Waste
                  </button>
                </div>

                {/* Waste List */}
                {wasteData.filter((w) => w.status !== 'delete').length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-stroke p-8 text-center dark:border-strokedark">
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada data. Klik "Tambah Waste" untuk menambah data
                      baru.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wasteData
                      .filter((waste) => waste.status !== 'delete')
                      .map((waste, _) => {
                        const actualIndex = wasteData.indexOf(waste);
                        return (
                          <div
                            key={actualIndex}
                            className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4"
                          >
                            {/* Waste Header */}
                            <div className="mb-4 flex items-start gap-4">
                              <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                  Waste{' '}
                                  {waste.status === 'new' && (
                                    <span className="text-xs text-meta-3">
                                      (Baru)
                                    </span>
                                  )}
                                </label>
                                <Select
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
                                  onChange={(selected) =>
                                    handleWasteSelect(actualIndex, selected)
                                  }
                                  placeholder="Pilih Waste"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              </div>
                              {/* <button
                                onClick={() => handleDeleteWaste(actualIndex)}
                                className="mt-7 rounded bg-meta-1 p-2.5 text-white hover:bg-opacity-90"
                                title="Hapus Waste"
                              >
                                <FaTrash />
                              </button> */}
                            </div>

                            {/* Kendala Section */}
                            <div className="ml-4 space-y-3 border-l-2 border-primary pl-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-black dark:text-white">
                                  List Kendala
                                </h4>
                                <button
                                  onClick={() => handleAddKendala(actualIndex)}
                                  className="inline-flex items-center gap-1.5 rounded bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90"
                                >
                                  <FaPlus size={10} /> Tambah Kendala
                                </button>
                              </div>

                              {waste.kendala.filter(
                                (k) => k.status !== 'delete',
                              ).length === 0 ? (
                                <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
                                  Belum ada kendala
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {waste.kendala
                                    .filter((k) => k.status !== 'delete')
                                    .map((kendala, _) => {
                                      const actualKendalaIndex =
                                        waste.kendala.indexOf(kendala);
                                      return (
                                        <div
                                          key={actualKendalaIndex}
                                          className="flex items-center gap-2 rounded bg-white p-2 dark:bg-boxdark"
                                        >
                                          <div className="flex-1">
                                            <Select
                                              options={getKendalaOptions().map(
                                                (kp) => ({
                                                  value: kp.id,
                                                  label: `${kp.kode} - ${kp.deskripsi}`,
                                                  kode: kp.kode,
                                                  deskripsi: kp.deskripsi,
                                                }),
                                              )}
                                              value={
                                                kendala.kode
                                                  ? {
                                                      value: kendala.id,
                                                      label: `${kendala.kode} - ${kendala.deskripsi}`,
                                                    }
                                                  : null
                                              }
                                              onChange={(selected) =>
                                                handleKendalaSelect(
                                                  actualIndex,
                                                  actualKendalaIndex,
                                                  selected,
                                                )
                                              }
                                              placeholder="Pilih Kendala"
                                              className="basic-single"
                                              classNamePrefix="select"
                                            />
                                          </div>
                                          <button
                                            onClick={() =>
                                              handleDeleteKendala(
                                                actualIndex,
                                                actualKendalaIndex,
                                              )
                                            }
                                            className="rounded bg-meta-1 p-2 text-white hover:bg-opacity-90"
                                            title="Hapus Kendala"
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 flex gap-3 border-t border-stroke pt-4 dark:border-strokedark">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded border border-stroke px-5 py-2.5 font-medium hover:shadow-1 dark:border-strokedark"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || loadingData || !selectedTahapan}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-primary px-5 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <FaSave />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TambahWasteModal;
