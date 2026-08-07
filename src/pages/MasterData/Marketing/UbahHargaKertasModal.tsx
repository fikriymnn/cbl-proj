import { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================================================
// Types
// ============================================================================

interface MasterBrand {
  id: number;
  kode_brand: string;
  nama_brand: string;
}

interface BarangKertas {
  id: number;
  id_brand: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori?: string | null;
  gramatur: number;
  harga: number;
  persentase: number;
  [key: string]: any;
}

interface EditedValue {
  harga: number | string;
  persentase: number | string;
}

interface ApiListResponse<T> {
  data: T;
  total_page?: number;
}

interface UbahHargaKertasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

// Duplex-type items are priced/edited by "persentase" and measured in "apki".
// Everything else is priced/edited by "harga" and measured in "kg".
const isDuplexItem = (namaBarang: string): boolean =>
  /duplex/i.test(namaBarang);

const formatRupiah = (value: number | string): string => {
  const num = Number(value) || 0;
  return num.toLocaleString('id-ID');
};

// ============================================================================
// Component
// ============================================================================

function UbahHargaKertasModal({
  isOpen,
  onClose,
  onSuccess,
}: UbahHargaKertasModalProps): JSX.Element | null {
  // Brand searchable select
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);

  // Filters
  const [gramaturFrom, setGramaturFrom] = useState<string>('');
  const [gramaturTo, setGramaturTo] = useState<string>('');

  // Results
  const [items, setItems] = useState<BarangKertas[]>([]);
  const [editedValues, setEditedValues] = useState<Record<number, EditedValue>>(
    {},
  );
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // UI state
  const [searching, setSearching] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Fetch brands once the modal opens
  useEffect(() => {
    if (isOpen) {
      getBrands();
    } else {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close brand dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.brand-dropdown-container')) {
        setShowBrandDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetAll = (): void => {
    setSelectedBrandId('');
    setBrandSearch('');
    setShowBrandDropdown(false);
    setGramaturFrom('');
    setGramaturTo('');
    setItems([]);
    setEditedValues({});
    setHasSearched(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  async function getBrands(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/brand`;
    try {
      const res = await axios.get<ApiListResponse<MasterBrand[]>>(url, {
        params: { limit: 100 },
        withCredentials: true,
      });
      setBrands(res.data.data);
    } catch (error: any) {
      console.log('Error fetching brands:', error);
    }
  }

  const filteredBrands = brands.filter((brand) =>
    `${brand.kode_brand} - ${brand.nama_brand}`
      .toLowerCase()
      .includes(brandSearch.toLowerCase()),
  );

  const handleSelectBrand = (brand: MasterBrand): void => {
    setSelectedBrandId(brand.id);
    setBrandSearch(`${brand.kode_brand} - ${brand.nama_brand}`);
    setShowBrandDropdown(false);
  };

  const handleClearBrand = (): void => {
    setSelectedBrandId('');
    setBrandSearch('');
  };

  // Core fetch — reused by the "Cari" button AND to refresh the list after
  // a successful save, so the modal always reflects the same filter/query.
  const fetchBarang = async (brandId: number | ''): Promise<void> => {
    if (!brandId) return;

    setErrorMsg('');
    setSearching(true);
    setHasSearched(true);

    const url = `${import.meta.env.VITE_API_LINK}/master/barangByGramature`;
    try {
      const res = await axios.get<ApiListResponse<BarangKertas[]>>(url, {
        params: {
          id_brand: brandId,
          gramatur_from: gramaturFrom || undefined,
          gramatur_to: gramaturTo || undefined,
        },
        withCredentials: true,
      });

      const data = res.data.data || [];
      setItems(data);

      // Seed the editable values with the current values from the server
      const seeded: Record<number, EditedValue> = {};
      data.forEach((item) => {
        seeded[item.id] = {
          harga: item.harga ?? 0,
          persentase: item.persentase ?? 0,
        };
      });
      setEditedValues(seeded);
    } catch (error: any) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message ||
          'Gagal mengambil data barang. Silakan coba lagi.',
      );
      setItems([]);
      setEditedValues({});
    } finally {
      setSearching(false);
    }
  };

  const handleCari = async (): Promise<void> => {
    if (!selectedBrandId) {
      setErrorMsg('Silakan pilih Merek terlebih dahulu.');
      return;
    }
    if (
      gramaturFrom &&
      gramaturTo &&
      Number(gramaturFrom) > Number(gramaturTo)
    ) {
      setErrorMsg('Gramatur "Dari" tidak boleh lebih besar dari "Sampai".');
      return;
    }
    setSuccessMsg('');
    await fetchBarang(selectedBrandId);
  };

  const handleResetFilter = (): void => {
    handleClearBrand();
    setGramaturFrom('');
    setGramaturTo('');
    setItems([]);
    setEditedValues({});
    setHasSearched(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleFieldChange = (
    id: number,
    field: 'harga' | 'persentase',
    value: string,
  ): void => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSimpan = async (): Promise<void> => {
    if (items.length === 0) return;

    const data_barang = items.map((item) => ({
      id: item.id,
      persentase: Number(editedValues[item.id]?.persentase) || 0,
      harga: Number(editedValues[item.id]?.harga) || 0,
    }));

    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/updateHargaKertasSatuan`;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await axios.put(url, { data_barang }, { withCredentials: true });

      // Refresh the main Master Barang table in the background.
      onSuccess?.();

      // Re-run the exact same query so the modal shows the freshly-saved
      // values instead of closing — the user stays in context.
      await fetchBarang(selectedBrandId);

      setSuccessMsg('Harga kertas berhasil diperbarui.');
      window.setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message ||
          'Gagal menyimpan perubahan harga. Silakan coba lagi.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full  min-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Ubah Harga Kertas Satuan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cari barang berdasarkan merek dan rentang gramatur, lalu ubah
              harga atau persentase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Brand searchable select */}
            <div className="relative brand-dropdown-container md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merek <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari dan pilih merek..."
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setSelectedBrandId('');
                  }}
                  onFocus={() => setShowBrandDropdown(true)}
                  className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={handleClearBrand}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    aria-label="Clear brand"
                  >
                    &times;
                  </button>
                )}
              </div>
              {showBrandDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectBrand(brand)}
                    >
                      {brand.kode_brand} - {brand.nama_brand}
                    </div>
                  ))}
                  {filteredBrands.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Merek tidak ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gramatur From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dari Gramatur
              </label>
              <input
                type="number"
                placeholder="Opsional"
                value={gramaturFrom}
                onChange={(e) => setGramaturFrom(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            {/* Gramatur To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampai Gramatur
              </label>
              <input
                type="number"
                placeholder="Opsional"
                value={gramaturTo}
                onChange={(e) => setGramaturTo(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleCari}
              disabled={searching}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {searching ? 'Mencari...' : 'Cari ...'}
            </button>
            <button
              onClick={handleResetFilter}
              disabled={searching}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
              {successMsg}
            </div>
          )}

          {/* Results */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto max-h-[45vh] overflow-y-auto">
              <table className="min-w-full table-auto text-xs">
                <thead className="bg-white sticky top-0 z-[1]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-10">
                      No
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Kode Barang
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                      Nama Barang
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-24">
                      Gramatur
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-24">
                      Satuan
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider w-48">
                      Harga / Persentase
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const duplex = isDuplexItem(item.nama_barang);
                    const current = editedValues[item.id] || {
                      harga: item.harga,
                      persentase: item.persentase,
                    };
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {item.kode_barang}
                        </td>
                        <td
                          className="px-3 py-2 text-gray-900 max-w-[280px] truncate"
                          title={item.nama_barang}
                        >
                          {item.nama_barang}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {item.gramatur}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              duplex
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {duplex ? 'APKI' : 'KG'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {duplex ? (
                            <div className="relative">
                              <input
                                type="number"
                                value={current.persentase}
                                onChange={(e) =>
                                  handleFieldChange(
                                    item.id,
                                    'persentase',
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-2 pr-6 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="0.01"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                %
                              </span>
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                Rp
                              </span>
                              <input
                                type="number"
                                value={current.harga}
                                onChange={(e) =>
                                  handleFieldChange(
                                    item.id,
                                    'harga',
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {!searching && hasSearched && items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Tidak ada barang ditemukan untuk filter ini.
                      </td>
                    </tr>
                  )}

                  {!hasSearched && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Pilih merek lalu klik "Cari ..." untuk menampilkan data
                        barang.
                      </td>
                    </tr>
                  )}

                  {searching && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {items.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-2">
              Menampilkan {items.length} barang. Total nilai contoh:{' '}
              {formatRupiah(
                items.reduce((sum, item) => sum + (Number(item.harga) || 0), 0),
              )}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving || items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UbahHargaKertasModal;
