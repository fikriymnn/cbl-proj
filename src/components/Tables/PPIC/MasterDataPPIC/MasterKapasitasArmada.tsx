import { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Loading from '../../../Loading';

const MasterKapasitasArmada = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ioData, setIoData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all'); // 'all', 'no_io', 'customer', 'produk'

  const [formData, setFormData] = useState<any>({
    no_io: '',
    customer: '',
    produk: '',
    jenis_packing: '',
    cgd: '',
    cgs: '',
    isi_dus: '',
    armada: [],
  });

  // Default armada configuration
  const defaultArmadaConfig = [
    {
      nama_armada: 'grandmax',
      kapasitas: 0,
      jumlah_orang: '0',
    },
    {
      nama_armada: 'engkel',
      kapasitas: 0,
      jumlah_orang: '0',
    },
    {
      nama_armada: 'double',
      kapasitas: 0,
      jumlah_orang: '0',
    },
    {
      nama_armada: 'fuso',
      kapasitas: 0,
      jumlah_orang: '0',
    },
    {
      nama_armada: 'wings',
      kapasitas: 0,
      jumlah_orang: '0',
    },
  ];

  const baseUrl = import.meta.env.VITE_API_LINK;

  useEffect(() => {
    fetchData();
    getIO();
  }, []);

  // Filter data based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item: any) => {
      const searchTermLower = searchTerm.toLowerCase();

      switch (searchBy) {
        case 'no_io':
          return item.no_io?.toLowerCase().includes(searchTermLower);
        case 'customer':
          return item.customer?.toLowerCase().includes(searchTermLower);
        case 'produk':
          return item.produk?.toLowerCase().includes(searchTermLower);
        case 'all':
        default:
          return (
            item.no_io?.toLowerCase().includes(searchTermLower) ||
            item.customer?.toLowerCase().includes(searchTermLower) ||
            item.produk?.toLowerCase().includes(searchTermLower)
          );
      }
    });

    setFilteredData(filtered);
  }, [searchTerm, searchBy, data]);

  async function getIO() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-io-approve`;
    try {
      const res = await axios.get(url, {});
      setIoData(res.data);
    } catch (error: any) {
      console.log('Error fetching IO:', error);
    }
  }

  // Create options for select dropdown from API data
  const ioOptions = ioData.map((item: any) => ({
    value: item.i_no_io,
    label: `${item.i_no_io} - ${item.e_customer_name}`,
    customer: item.e_customer_name,
    produk: item.e_product_name,
    isi_dus: item.n_isi_dlm_pack,
    jenis_packing: item.e_jenis_pack,
    id_okp: item.i_id_okp,
    no_okp: item.i_no_okp,
    revisi: item.i_revisi,
    tanggal_buat: item.tanggal_buat,
  }));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/master/ppic/kapasitasJadwalKirim`,
        {
          withCredentials: true,
        },
      );
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeArmada = () => {
    return defaultArmadaConfig.map((armada: any) => ({ ...armada }));
  };

  // Function to parse jenis_packing and update CGS/CGD
  const parseJenisPacking = (jenisPacking: string) => {
    const cgsMatch = jenisPacking.match(/CGS-(\d+)/i);
    const cgdMatch = jenisPacking.match(/CGD-(\d+)/i);

    if (cgsMatch) {
      return { cgs: cgsMatch[1], cgd: '' };
    } else if (cgdMatch) {
      return { cgs: '', cgd: cgdMatch[1] };
    } else {
      return { cgs: '', cgd: '' };
    }
  };

  const handleIOChange = (selectedOption: any) => {
    if (selectedOption) {
      const { cgs, cgd } = parseJenisPacking(selectedOption.jenis_packing);
      setFormData((prev: any) => ({
        ...prev,
        no_io: selectedOption.value,
        customer: selectedOption.customer,
        produk: selectedOption.produk,
        isi_dus: selectedOption.isi_dus,
        jenis_packing: selectedOption.jenis_packing,
        cgs,
        cgd,
        armada: initializeArmada(),
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        no_io: '',
        customer: '',
        produk: '',
        isi_dus: '',
        jenis_packing: '',
        cgs: '',
        cgd: '',
        armada: initializeArmada(),
      }));
    }
  };

  const handleArmadaChange = (index: any, field: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      armada: prev.armada.map((item: any, i: any) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      no_io: '',
      customer: '',
      produk: '',
      jenis_packing: '',
      cgd: '',
      cgs: '',
      isi_dus: '',
      armada: initializeArmada(),
    });
    setEditingId(null);
  };

  const handleEdit = async (id: any) => {
    console.log('Edit button clicked with id:', id);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/master/ppic/kapasitasJadwalKirim/${id}`,
        {
          withCredentials: true,
        },
      );
      const recordData = response.data.data;

      // Initialize with default armada and then update with existing data
      const initializedArmada = initializeArmada();
      const existingArmada = recordData.armada || [];

      // Update the initialized armada with existing data, preserving database fields
      const updatedArmada = initializedArmada.map((defaultItem) => {
        const existingItem = existingArmada.find(
          (item: any) => item.nama_armada === defaultItem.nama_armada,
        );
        return existingItem
          ? {
              // Preserve database fields for existing items
              id: existingItem.id,
              id_kapasitas_jadwal_kirim: existingItem.id_kapasitas_jadwal_kirim,
              createdAt: existingItem.createdAt,
              updatedAt: existingItem.updatedAt,
              // Editable fields
              nama_armada: existingItem.nama_armada,
              kapasitas: existingItem.kapasitas || 0,
              jumlah_orang: existingItem.jumlah_orang || '',
            }
          : {
              // New items don't have database fields yet
              nama_armada: defaultItem.nama_armada,
              kapasitas: defaultItem.kapasitas || 0,
              jumlah_orang: defaultItem.jumlah_orang || '',
            };
      });

      // Construct jenis_packing from existing CGS/CGD data
      let jenisPacking = '';
      if (recordData.cgs) {
        jenisPacking = `CGS-${recordData.cgs}`;
      } else if (recordData.cgd) {
        jenisPacking = `CGD-${recordData.cgd}`;
      }

      const transformedData: any = {
        no_io: recordData.no_io || '',
        customer: recordData.customer || '',
        produk: recordData.produk || '',
        jenis_packing: jenisPacking,
        cgd: recordData.cgd || '',
        cgs: recordData.cgs || '',
        isi_dus: recordData.isi_dus || '',
        armada: updatedArmada,
        // Include database fields for existing records
        id: recordData.id,
        createdAt: recordData.createdAt,
        updatedAt: recordData.updatedAt,
      };

      setFormData(transformedData);
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setIsLoading(true);
      try {
        await axios.delete(
          `${baseUrl}/master/ppic/kapasitasJadwalKirim/${id}`,
          {
            withCredentials: true,
          },
        );
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('Submit with editingId:', editingId);
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        // Include database fields for existing records
        ...(editingId
          ? {
              id: editingId,
              createdAt: formData.createdAt,
              updatedAt: formData.updatedAt,
            }
          : {}),
        armada: formData.armada.map((item: any) => {
          // For existing armada items (those with id), preserve database fields
          if (item.id) {
            return {
              id: item.id,
              id_kapasitas_jadwal_kirim: item.id_kapasitas_jadwal_kirim,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              nama_armada: item.nama_armada,
              kapasitas: item.kapasitas || 0,
              jumlah_orang: item.jumlah_orang || '',
            };
          } else {
            // For new armada items, only send the essential fields
            return {
              nama_armada: item.nama_armada,
              kapasitas: item.kapasitas || 0,
              jumlah_orang: item.jumlah_orang || '',
            };
          }
        }),
      };

      if (editingId) {
        await axios.put(
          `${baseUrl}/master/ppic/kapasitasJadwalKirim/${editingId}`,
          submitData,
          {
            withCredentials: true,
          },
        );
      } else {
        console.log('Creating new record');
        await axios.post(
          `${baseUrl}/master/ppic/kapasitasJadwalKirim`,
          submitData,
          {
            withCredentials: true,
          },
        );
      }

      resetForm();
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowForm = () => {
    setFormData((prev: any) => ({
      ...prev,
      armada: initializeArmada(),
    }));
    setShowForm(true);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchBy('all');
  };

  // Custom option component for Select
  const CustomOption = ({ data, ...props }: any) => (
    <div
      {...props.innerProps}
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
    >
      <div className="font-medium text-gray-900">{data.value}</div>
      <div className="text-sm text-gray-600">{data.customer}</div>
      <div className="text-xs text-gray-500 truncate">{data.produk}</div>
      <div className="text-xs text-blue-600 mt-1">
        {data.jenis_packing} • Isi: {data.isi_dus}
      </div>
    </div>
  );

  return (
    <main className="overflow-x-scroll bg-gray-50 min-h-screen">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl shadow-lg flex flex-col gap-6 py-6 px-8 ">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Master Kapasitas Armada
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola data kapasitas armada pengiriman
            </p>
          </div>
          <button
            onClick={handleShowForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Tambah Data
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pencarian
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Masukkan kata kunci pencarian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="flex-shrink-0 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan {filteredData.length} dari {data.length} data
              {searchBy !== 'all' && (
                <span className="ml-2 text-blue-600">
                  (berdasarkan{' '}
                  {searchBy === 'no_io'
                    ? 'No IO'
                    : searchBy === 'customer'
                    ? 'Customer'
                    : 'Produk'}
                  )
                </span>
              )}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Data' : 'Tambah Data Baru'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* IO Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No IO
                  </label>
                  <Select
                    value={ioOptions.find(
                      (option) => option.value === formData.no_io,
                    )}
                    onChange={handleIOChange}
                    options={ioOptions}
                    placeholder="Pilih No IO..."
                    isClearable
                    className="text-sm"
                    components={{ Option: CustomOption }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '42px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#3b82f6',
                        },
                      }),
                      option: (base) => ({
                        ...base,
                        padding: 0,
                      }),
                    }}
                  />
                </div>

                {/* Customer (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>

                {/* Produk (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Produk
                  </label>
                  <textarea
                    value={formData.produk}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none resize-none"
                  />
                </div>

                {/* Jenis Packing (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Packing
                  </label>
                  <input
                    type="text"
                    value={formData.jenis_packing}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                    placeholder="Auto-filled from IO selection"
                  />
                </div>

                {/* CGS and CGD (Auto-filled from jenis_packing) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CGS
                    </label>
                    <input
                      type="text"
                      value={formData.cgs}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                      placeholder="Auto-filled from Jenis Packing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CGD
                    </label>
                    <input
                      type="text"
                      value={formData.cgd}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                      placeholder="Auto-filled from Jenis Packing"
                    />
                  </div>
                </div>

                {/* Isi Dus (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Isi Dus
                  </label>
                  <input
                    type="number"
                    value={formData.isi_dus}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>

                {/* Armada Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Armada Configuration
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData?.armada.map((armada: any, index: any) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="mb-3">
                          <span className="font-semibold text-blue-600 capitalize text-sm">
                            {armada.nama_armada}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Kapasitas
                            </label>
                            <input
                              type="number"
                              value={armada.kapasitas}
                              onChange={(e) =>
                                handleArmadaChange(
                                  index,
                                  'kapasitas',
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Jumlah Orang
                            </label>
                            <input
                              type="text"
                              value={armada.jumlah_orang}
                              onChange={(e) =>
                                handleArmadaChange(
                                  index,
                                  'jumlah_orang',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="3 Orang"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    {editingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    No IO
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    CGS
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    CGD
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    Isi Dus
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-blue-500">
                    Armada
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredData?.map((item: any, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-200"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                      {item.no_io}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      <div
                        className="max-w-[200px] truncate"
                        title={item.customer}
                      >
                        {item.customer}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      <div
                        className="max-w-[250px] truncate"
                        title={item.produk}
                      >
                        {item.produk}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {item.cgs && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.cgs}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {item.cgd && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {item.cgd}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium border-r border-gray-200">
                      {item.isi_dus}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      <div className="space-y-2 min-w-[280px]">
                        {item.armada?.map((armada: any, armadaIndex: any) => (
                          <div
                            key={armadaIndex}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm font-semibold text-blue-600 capitalize">
                                  {armada.nama_armada}
                                </span>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Kapasitas
                                </label>
                                <span className="text-sm font-medium text-gray-700">
                                  {armada.kapasitas}
                                </span>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Jumlah Orang
                                </label>
                                <span className="text-sm font-medium text-gray-700">
                                  {armada.jumlah_orang}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada data tersedia
            </h3>
            <p className="text-gray-500">
              Mulai dengan menambahkan data kapasitas armada baru
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MasterKapasitasArmada;
