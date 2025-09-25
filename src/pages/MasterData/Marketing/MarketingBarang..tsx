import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Pagination } from '@mui/material';
import DefaultLayout from '../../../layout/DefaultLayout';

// Types
interface MasterBarang {
  id: number;
  id_brand: number;
  id_purchase_unit: number;
  id_inventory_unit: number;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string | null;
  gramatur: number;
  panjang: number;
  lebar: number;
  harga: number;
  batas_harga: number | null;
  persentase: number;
  pajak: number;
  harga_per_satuan: number | null;
  inventory_convert: number;
  warehouse: string;
  keterangan: string;
  // For display purposes (populated from relations)
  brand_name?: string;
  purchase_unit_name?: string;
  inventory_unit_name?: string;
}

interface MasterBarangForm {
  id_brand: number | string;
  id_purchase_unit: number | string;
  id_inventory_unit: number | string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  sub_kategori: string;
  gramatur: number | string;
  panjang: number | string;
  lebar: number | string;
  harga: number | string;
  batas_harga: number | string;
  persentase: number | string;
  pajak: number | string;
  harga_per_satuan: number | string;
  inventory_convert: number | string;
  warehouse: string;
  keterangan: string;
}

interface MasterBrand {
  id: number;
  kode_brand: string;
  nama_brand: string;
}

interface MasterUnit {
  id: number;
  kode_unit: string;
  nama_unit: string;
}

interface SearchState {
  barangs: string;
}

interface TotalPages {
  barangs: number;
}

interface ApiResponse<T> {
  data: T;
  total_page: number;
}

function MarketingBarang(): JSX.Element {
  const [barangs, setBarangs] = useState<MasterBarang[]>([]);
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<TotalPages>({ barangs: 0 });
  const [searches, setSearches] = useState<SearchState>({ barangs: '' });
  const [barangForm, setBarangForm] = useState<MasterBarangForm>({
    id_brand: '',
    id_purchase_unit: '',
    id_inventory_unit: '',
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    sub_kategori: '',
    gramatur: '',
    panjang: '',
    lebar: '',
    harga: '',
    batas_harga: '',
    persentase: '',
    pajak: '',
    harga_per_satuan: '',
    inventory_convert: '',
    warehouse: '',
    keterangan: '',
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBarang, setEditingBarang] = useState<MasterBarang | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Dropdown search states
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [purchaseUnitSearch, setPurchaseUnitSearch] = useState<string>('');
  const [inventoryUnitSearch, setInventoryUnitSearch] = useState<string>('');
  const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);
  const [showPurchaseUnitDropdown, setShowPurchaseUnitDropdown] =
    useState<boolean>(false);
  const [showInventoryUnitDropdown, setShowInventoryUnitDropdown] =
    useState<boolean>(false);

  useEffect(() => {
    getMasterBarang();
    getMasterBrands();
    getMasterUnits();
  }, [page]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowBrandDropdown(false);
        setShowPurchaseUnitDropdown(false);
        setShowInventoryUnitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch master barang data
  async function getMasterBarang(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/barang`;
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<MasterBarang[]>>(url, {
        params: {
          page: page,
          limit: 15,
          search: searches.barangs || undefined,
        },
        withCredentials: true,
      });
      console.log('Fetched barang data:', res.data);
      setBarangs(res.data.data);
      setTotalPages((prev) => ({ ...prev, barangs: res.data.total_page }));
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch master brands
  async function getMasterBrands(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/brand`;
    try {
      const res = await axios.get<ApiResponse<MasterBrand[]>>(url, {
        params: { limit: 100 }, // Get all brands
        withCredentials: true,
      });
      setBrands(res.data.data);
    } catch (error: any) {
      console.log('Error fetching brands:', error);
    }
  }

  // Fetch master units
  async function getMasterUnits(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/master/unit`;
    try {
      const res = await axios.get<ApiResponse<MasterUnit[]>>(url, {
        params: { limit: 100 }, // Get all units
        withCredentials: true,
      });
      setUnits(res.data.data);
    } catch (error: any) {
      console.log('Error fetching units:', error);
    }
  }

  const handleSearch = (): void => {
    setPage(1);
    getMasterBarang();
  };

  const handleReset = (): void => {
    setSearches({ barangs: '' });
    setPage(1);
    getMasterBarang();
  };

  const handleAddBarang = (): void => {
    setShowForm(true);
    setEditingBarang(null);
    setBarangForm({
      id_brand: '',
      id_purchase_unit: '',
      id_inventory_unit: '',
      kode_barang: '',
      nama_barang: '',
      kategori: '',
      sub_kategori: '',
      gramatur: '',
      panjang: '',
      lebar: '',
      harga: '',
      batas_harga: '',
      persentase: '',
      pajak: '',
      harga_per_satuan: '',
      inventory_convert: '',
      warehouse: '',
      keterangan: '',
    });
    resetDropdownSearches();
  };

  const resetDropdownSearches = (): void => {
    setBrandSearch('');
    setPurchaseUnitSearch('');
    setInventoryUnitSearch('');
  };

  const openModal = (barang: MasterBarang): void => {
    setEditingBarang(barang);
    setBarangForm({
      id_brand: barang.id_brand,
      id_purchase_unit: barang.id_purchase_unit,
      id_inventory_unit: barang.id_inventory_unit,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori,
      sub_kategori: barang.sub_kategori || '',
      gramatur: barang.gramatur,
      panjang: barang.panjang,
      lebar: barang.lebar,
      harga: barang.harga,
      batas_harga: barang.batas_harga || '',
      persentase: barang.persentase,
      pajak: barang.pajak,
      harga_per_satuan: barang.harga_per_satuan || '',
      inventory_convert: barang.inventory_convert,
      warehouse: barang.warehouse,
      keterangan: barang.keterangan,
    });

    // Set dropdown display values
    const selectedBrand = brands.find((b) => b.id === barang.id_brand);
    const selectedPurchaseUnit = units.find(
      (u) => u.id === barang.id_purchase_unit,
    );
    const selectedInventoryUnit = units.find(
      (u) => u.id === barang.id_inventory_unit,
    );

    setBrandSearch(
      selectedBrand
        ? `${selectedBrand.kode_brand} - ${selectedBrand.nama_brand}`
        : '',
    );
    setPurchaseUnitSearch(
      selectedPurchaseUnit
        ? `${selectedPurchaseUnit.kode_unit} - ${selectedPurchaseUnit.nama_unit}`
        : '',
    );
    setInventoryUnitSearch(
      selectedInventoryUnit
        ? `${selectedInventoryUnit.kode_unit} - ${selectedInventoryUnit.nama_unit}`
        : '',
    );

    setShowForm(true);
  };

  const closeModal = (): void => {
    setShowForm(false);
    setEditingBarang(null);
    setShowBrandDropdown(false);
    setShowPurchaseUnitDropdown(false);
    setShowInventoryUnitDropdown(false);
    resetDropdownSearches();
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);
      const url = editingBarang
        ? `${import.meta.env.VITE_API_LINK}/master/barang/${editingBarang.id}`
        : `${import.meta.env.VITE_API_LINK}/master/barang`;

      const method = editingBarang ? 'put' : 'post';

      // Convert form data to proper types
      const formData = {
        id_brand: Number(barangForm.id_brand),
        id_purchase_unit: Number(barangForm.id_purchase_unit),
        id_inventory_unit: Number(barangForm.id_inventory_unit),
        kode_barang: barangForm.kode_barang,
        nama_barang: barangForm.nama_barang,
        kategori: barangForm.kategori,
        sub_kategori: barangForm.sub_kategori || null,
        gramatur: Number(barangForm.gramatur) || 0,
        panjang: Number(barangForm.panjang) || 0,
        lebar: Number(barangForm.lebar) || 0,
        harga: Number(barangForm.harga) || 0,
        batas_harga: barangForm.batas_harga
          ? Number(barangForm.batas_harga)
          : null,
        persentase: Number(barangForm.persentase) || 0,
        pajak: Number(barangForm.pajak) || 0,
        harga_per_satuan: barangForm.harga_per_satuan
          ? Number(barangForm.harga_per_satuan)
          : null,
        inventory_convert: Number(barangForm.inventory_convert) || 0,
        warehouse: barangForm.warehouse,
        keterangan: barangForm.keterangan,
      };

      console.log(
        editingBarang
          ? 'Updating barang with data:'
          : 'Creating barang with data:',
        formData,
      );
      await axios[method](url, formData, { withCredentials: true });

      getMasterBarang();
      closeModal();
      alert(
        editingBarang
          ? 'Barang updated successfully!'
          : 'Barang created successfully!',
      );
    } catch (error: any) {
      console.log(error);
      alert(
        'Error saving barang: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ): void => {
    setPage(value);
  };

  const deleteBarang = async (id: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/barang/${id}`;
    try {
      if (confirm('Are you sure you want to delete this barang data?')) {
        await axios.delete(url, { withCredentials: true });
        getMasterBarang();
        alert('Barang deleted successfully!');
      }
    } catch (error: any) {
      console.log(error);
      alert(
        'Error deleting barang: ' +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Filter functions for dropdowns
  const filteredBrands = brands.filter((brand) =>
    `${brand.kode_brand} - ${brand.nama_brand}`
      .toLowerCase()
      .includes(brandSearch.toLowerCase()),
  );

  const filteredPurchaseUnits = units.filter((unit) =>
    `${unit.kode_unit} - ${unit.nama_unit}`
      .toLowerCase()
      .includes(purchaseUnitSearch.toLowerCase()),
  );

  const filteredInventoryUnits = units.filter((unit) =>
    `${unit.kode_unit} - ${unit.nama_unit}`
      .toLowerCase()
      .includes(inventoryUnitSearch.toLowerCase()),
  );

  // Helper function to get brand name by id
  const getBrandName = (id: number): string => {
    const brand = brands.find((b) => b.id === id);
    return brand
      ? `${brand.kode_brand} - ${brand.nama_brand}`
      : 'Unknown Brand';
  };

  // Helper function to get unit name by id
  const getUnitName = (id: number): string => {
    const unit = units.find((u) => u.id === id);
    return unit ? `${unit.kode_unit} - ${unit.nama_unit}` : 'Unknown Unit';
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <p className="font-semibold md:text-[24px] text-[18px] text-primary mb-4">
          Master Data &gt; Master Barang
        </p>

        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search barang..."
              value={searches.barangs}
              onChange={(e) =>
                setSearches({ ...searches, barangs: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={handleAddBarang}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Barang
          </button>
        </div>

        {/* Barang Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Barang
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Unit
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory Unit
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barangs.map((barang, index) => (
                <tr key={barang.id}>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {(page - 1) * 15 + index + 1}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {barang.kode_barang}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[150px] truncate"
                    title={barang.nama_barang}
                  >
                    {barang.nama_barang}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[100px] truncate"
                    title={getBrandName(barang.id_brand)}
                  >
                    {getBrandName(barang.id_brand)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    {barang.kategori}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    Rp {barang.harga.toLocaleString('id-ID')}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[100px] truncate"
                    title={getUnitName(barang.id_purchase_unit)}
                  >
                    {getUnitName(barang.id_purchase_unit)}
                  </td>
                  <td
                    className="px-2 py-2 text-xs text-gray-900 max-w-[100px] truncate"
                    title={getUnitName(barang.id_inventory_unit)}
                  >
                    {getUnitName(barang.id_inventory_unit)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium space-x-1">
                    <button
                      onClick={() => openModal(barang)}
                      className="text-blue-600 hover:text-blue-900 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBarang(barang.id)}
                      className="text-red-600 hover:text-red-900 px-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {barangs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-2 py-2 text-center text-xs text-gray-500"
                  >
                    No barang data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-center mt-3 pb-2">
          <Stack spacing={2}>
            <Pagination
              count={totalPages.barangs}
              page={page}
              color="primary"
              size="small"
              onChange={handlePageChange}
            />
          </Stack>
        </div>

        {/* Add/Edit Barang Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingBarang ? 'Edit Barang' : 'Add Barang'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kode Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kode Barang *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter kode barang"
                      value={barangForm.kode_barang}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          kode_barang: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Barang *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Nama barang"
                      value={barangForm.nama_barang}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          nama_barang: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {/* Brand Selection */}
                  <div className="relative dropdown-container">
                    <label className="block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Search and select brand..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      onFocus={() => setShowBrandDropdown(true)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showBrandDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setBarangForm({
                                ...barangForm,
                                id_brand: brand.id,
                              });
                              setBrandSearch(
                                `${brand.kode_brand} - ${brand.nama_brand}`,
                              );
                              setShowBrandDropdown(false);
                            }}
                          >
                            {brand.kode_brand} - {brand.nama_brand}
                          </div>
                        ))}
                        {filteredBrands.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No brands found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <select
                      name="kategori"
                      id="kategori"
                      value={barangForm.kategori}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          kategori: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Kategori</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Ivory">Ivory</option>
                      <option value="Duplex Khusus">Duplex Khusus</option>
                      <option value="Plate">Plate</option>
                      <option value="Coating">Coating</option>
                      <option value="Pond">Pond</option>
                      <option value="Pons Pisau">Pons Pisau</option>
                      <option value="Ongkos Pons">Ongkos Pons</option>
                      <option value="Special Finishing">
                        Special Finishing
                      </option>
                      <option value="LEM">LEM</option>
                      <option value="CORRUGATED">CORRUGATED</option>
                      <option value="CASSING">CASSING</option>
                    </select>
                  </div>
                  {/*Sub Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sub Kategori
                    </label>
                    <select
                      name="sub_kategori"
                      id="sub_kategori"
                      value={barangForm.sub_kategori}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          sub_kategori: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Sub Kategori</option>
                      <option value="Kertas">Kertas</option>
                      <option value="Mesin">Mesin</option>
                      <option value="Coating">Coating</option>
                      <option value="Lipat">Lipat</option>
                      <option value="Potong Jadi">Potong Jadi</option>
                    </select>
                  </div>
                  {/* Gramatur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gramatur
                    </label>
                    <input
                      type="number"
                      placeholder="Enter gramatur"
                      value={barangForm.gramatur}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          gramatur: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Panjang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Panjang (mm)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter panjang"
                      value={barangForm.panjang}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          panjang: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.00001"
                    />
                  </div>

                  {/* Lebar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lebar (mm)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter lebar"
                      value={barangForm.lebar}
                      onChange={(e) =>
                        setBarangForm({ ...barangForm, lebar: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.00001"
                    />
                  </div>

                  {/* Harga */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Harga
                    </label>
                    <input
                      type="number"
                      placeholder="Enter harga"
                      value={barangForm.harga}
                      onChange={(e) =>
                        setBarangForm({ ...barangForm, harga: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.00001"
                    />
                  </div>

                  {/* Batas Harga */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Batas Harga
                    </label>
                    <input
                      type="number"
                      placeholder="Enter batas harga"
                      value={barangForm.batas_harga}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          batas_harga: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.00001"
                    />
                  </div>

                  {/* Persentase */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Persentase (%)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter persentase"
                      value={barangForm.persentase}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          persentase: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.00001"
                    />
                  </div>

                  {/* Pajak */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pajak (%)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter pajak"
                      value={barangForm.pajak}
                      onChange={(e) =>
                        setBarangForm({ ...barangForm, pajak: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="100"
                      step="0.00001"
                    />
                  </div>

                  <div className=" col-span-2 grid grid-cols-3 gap-4">
                    {/* Purchase Unit Selection */}
                    <div className="relative dropdown-container">
                      <label className="block text-sm font-medium text-gray-700">
                        Purchase Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Search and select purchase unit..."
                        value={purchaseUnitSearch}
                        onChange={(e) => setPurchaseUnitSearch(e.target.value)}
                        onFocus={() => setShowPurchaseUnitDropdown(true)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {showPurchaseUnitDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredPurchaseUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setBarangForm({
                                  ...barangForm,
                                  id_purchase_unit: unit.id,
                                });
                                setPurchaseUnitSearch(
                                  `${unit.kode_unit} - ${unit.nama_unit}`,
                                );
                                setShowPurchaseUnitDropdown(false);
                              }}
                            >
                              {unit.kode_unit} - {unit.nama_unit}
                            </div>
                          ))}
                          {filteredPurchaseUnits.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No units found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inventory Unit Selection */}
                    <div className="relative dropdown-container">
                      <label className="block text-sm font-medium text-gray-700">
                        Inventory Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Search and select inventory unit..."
                        value={inventoryUnitSearch}
                        onChange={(e) => setInventoryUnitSearch(e.target.value)}
                        onFocus={() => setShowInventoryUnitDropdown(true)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {showInventoryUnitDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredInventoryUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setBarangForm({
                                  ...barangForm,
                                  id_inventory_unit: unit.id,
                                });
                                setInventoryUnitSearch(
                                  `${unit.kode_unit} - ${unit.nama_unit}`,
                                );
                                setShowInventoryUnitDropdown(false);
                              }}
                            >
                              {unit.kode_unit} - {unit.nama_unit}
                            </div>
                          ))}
                          {filteredInventoryUnits.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No units found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Inventory Convert */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Inventory Convert
                      </label>
                      <input
                        type="number"
                        placeholder="Enter inventory convert"
                        value={barangForm.inventory_convert}
                        onChange={(e) =>
                          setBarangForm({
                            ...barangForm,
                            inventory_convert: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  {/* Harga per Satuan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Harga per Satuan
                    </label>
                    <input
                      type="number"
                      placeholder="Enter harga per satuan"
                      value={barangForm.harga_per_satuan}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          harga_per_satuan: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Warehouse
                    </label>
                    <input
                      type="text"
                      placeholder="Enter warehouse"
                      value={barangForm.warehouse}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          warehouse: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Keterangan - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Keterangan
                  </label>
                  <textarea
                    placeholder="Enter keterangan"
                    value={barangForm.keterangan}
                    onChange={(e) =>
                      setBarangForm({
                        ...barangForm,
                        keterangan: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingBarang ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default MarketingBarang;
