import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';
import Select from 'react-select';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TambahWasteModal from './TambahWasteModal';

const API_BASE = import.meta.env.VITE_API_LINK;

interface KodeProduksi {
  id: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  id_tahapan_produksi: number;
  id_kriteria_qty_produksi: number | null;
  id_kriteria_qty_qc: number | null;
  id_kriteria_qty_mtc: number | null;
  id_kriteria_waktu_produksi: number | null;
  id_kriteria_waktu_qc: number | null;
  id_kriteria_waktu_mtc: number | null;
  id_kriteria_frekuensi_produksi: number | null;
  id_kriteria_frekuensi_qc: number | null;
  id_kriteria_frekuensi_mtc: number | null;
  id_kategori_kendala: number;
  target_department: number[];
}

interface Department {
  id: number;
  nama_department: string;
}

interface Kriteria {
  id: number;
  kriteria: string;
  value: number;
  tipe: string;
  bagian: string;
}

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface KategoriKendala {
  id: number;
  kategori: string;
}

interface ApiResponse {
  data: KodeProduksi[];
  total_page: number;
  current_page: number;
  total_data: number;
}

const MasterTableKodeProduksi: React.FC = () => {
  const [data, setData] = useState<KodeProduksi[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [kategoriKendalaList, setKategoriKendalaList] = useState<
    KategoriKendala[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Filter & Pagination states
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTahapan, setSelectedTahapan] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    proses_produksi: 'Setting',
    kode: '',
    deskripsi: '',
    id_tahapan_produksi: 0,
    id_kriteria_qty_produksi: null as number | null,
    id_kriteria_qty_qc: null as number | null,
    id_kriteria_qty_mtc: null as number | null,
    id_kriteria_waktu_produksi: null as number | null,
    id_kriteria_waktu_qc: null as number | null,
    id_kriteria_waktu_mtc: null as number | null,
    id_kriteria_frekuensi_produksi: null as number | null,
    id_kriteria_frekuensi_qc: null as number | null,
    id_kriteria_frekuensi_mtc: null as number | null,
    id_kategori_kendala: null as number | null,
    target_department: [] as number[],
  });

  const prosesOptions = [
    'Setting',
    'Produksi',
    'Kendala',
    'Pending',
    'Off',
    'Waste',
  ];

  // Limit options as buttons
  const limitOptions = [10, 25, 50, 100];

  useEffect(() => {
    fetchDepartments();
    fetchKriteria();
    fetchTahapan();
    fetchKategoriKendala();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, search, selectedTahapan, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page,
        limit: limit,
      };

      if (search) {
        params.search = search;
      }

      if (selectedTahapan) {
        params.id_tahapan_produksi = selectedTahapan.value;
      }

      const response = await axios.get<ApiResponse>(
        `${API_BASE}/master/produksi/kodeProduksi`,
        { params },
      );
      console.log('Fetched data:', response.data);
      setData(response.data.data || []);
      setTotalPage(response.data.total_page || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/master/hr/department`);
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchKriteria = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/kriteriaKendala`,
      );
      setKriteriaList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching kriteria:', error);
    }
  };

  const fetchTahapan = async () => {
    try {
      const response = await axios.get(`${API_BASE}/master/tahapan`);
      setTahapanList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tahapan:', error);
    }
  };

  const fetchKategoriKendala = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/kategoriKendala`,
      );
      setKategoriKendalaList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching kategori kendala:', error);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearchInput('');
    setSearch('');
    setSelectedTahapan(null);
    setLimit(10);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const getKriteriaByTypeAndBagian = (tipe: string, bagian: string) => {
    return kriteriaList.filter(
      (k) =>
        k.tipe.toLowerCase() === tipe.toLowerCase() &&
        k.bagian.toLowerCase() === bagian.toLowerCase(),
    );
  };

  const getTahapanName = (id: number) => {
    const tahapan = tahapanList.find((t) => t.id === id);
    return tahapan ? tahapan.nama_tahapan : '-';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && currentId) {
        await axios.put(
          `${API_BASE}/master/produksi/kodeProduksi/${currentId}`,
          formData,
        );
      } else {
        await axios.post(`${API_BASE}/master/produksi/kodeProduksi`, formData);
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: KodeProduksi) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      proses_produksi: item.proses_produksi,
      kode: item.kode,
      deskripsi: item.deskripsi,
      id_tahapan_produksi: item.id_tahapan_produksi,
      id_kriteria_qty_produksi: item.id_kriteria_qty_produksi,
      id_kriteria_qty_qc: item.id_kriteria_qty_qc,
      id_kriteria_qty_mtc: item.id_kriteria_qty_mtc,
      id_kriteria_waktu_produksi: item.id_kriteria_waktu_produksi,
      id_kriteria_waktu_qc: item.id_kriteria_waktu_qc,
      id_kriteria_waktu_mtc: item.id_kriteria_waktu_mtc,
      id_kriteria_frekuensi_produksi: item.id_kriteria_frekuensi_produksi,
      id_kriteria_frekuensi_qc: item.id_kriteria_frekuensi_qc,
      id_kriteria_frekuensi_mtc: item.id_kriteria_frekuensi_mtc,
      id_kategori_kendala: item.id_kategori_kendala,
      target_department: item.target_department,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      proses_produksi: 'Setting',
      kode: '',
      deskripsi: '',
      id_tahapan_produksi: 0,
      id_kriteria_qty_produksi: null,
      id_kriteria_qty_qc: null,
      id_kriteria_qty_mtc: null,
      id_kriteria_waktu_produksi: null,
      id_kriteria_waktu_qc: null,
      id_kriteria_waktu_mtc: null,
      id_kriteria_frekuensi_produksi: null,
      id_kriteria_frekuensi_qc: null,
      id_kriteria_frekuensi_mtc: null,
      id_kategori_kendala: null,
      target_department: [],
    });
  };

  const isKendalaSelected = formData.proses_produksi === 'Kendala';

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">
              Kode Produksi
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWasteModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-success px-5 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                <FaPlus />
                Set Waste Cetak
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                <FaPlus />
                Tambah Data
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Cari
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Cari kode atau deskripsi..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Tahapan Produksi
              </label>
              <Select
                isClearable
                options={tahapanList.map((tahapan) => ({
                  value: tahapan.id,
                  label: tahapan.nama_tahapan,
                }))}
                value={selectedTahapan}
                onChange={(selected) => {
                  setSelectedTahapan(selected);
                  setPage(1);
                }}
                placeholder="Pilih Tahapan"
                className="basic-single"
                classNamePrefix="select"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilter}
                className="w-full rounded border border-stroke px-4 py-2 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        <div className="p-7">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        No
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Proses
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Kode
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Deskripsi
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Tahapan
                      </th>
                      <th className="px-4 py-4 font-medium text-black dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            {item.proses_produksi}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            {item.kode}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            {item.deskripsi}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            {getTahapanName(item.id_tahapan_produksi)}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                            >
                              <FaEdit />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="border-b border-[#eee] px-4 py-8 text-center dark:border-strokedark"
                        >
                          Tidak ada data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black dark:text-white">
                    Rows per page:
                  </span>
                  <div className="flex gap-1">
                    {limitOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleLimitChange(option)}
                        className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                          limit === option
                            ? 'bg-primary text-white'
                            : 'bg-gray-2 text-black hover:bg-gray-3 dark:bg-meta-4 dark:text-white dark:hover:bg-meta-4/80'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <Stack spacing={2}>
                  <Pagination
                    count={totalPage}
                    page={page}
                    color="primary"
                    onChange={(e, i) => {
                      setPage(i);
                    }}
                  />
                </Stack>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Kode Produksi Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-medium text-black dark:text-white">
                {editMode ? 'Edit' : 'Tambah'} Kode Produksi
              </h3>
              <button
                onClick={resetForm}
                className="text-2xl hover:text-primary"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[70vh] overflow-y-auto px-2"
            >
              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tahapan Produksi
                </label>
                <select
                  value={formData.id_tahapan_produksi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_tahapan_produksi: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="">Pilih Tahapan</option>
                  {tahapanList.map((tahapan) => (
                    <option key={tahapan.id} value={tahapan.id}>
                      {tahapan.nama_tahapan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Proses Produksi
                </label>
                <select
                  value={formData.proses_produksi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proses_produksi: e.target.value,
                    })
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  {prosesOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Kode
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) =>
                    setFormData({ ...formData, kode: e.target.value })
                  }
                  placeholder="Masukkan kode"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Masukkan deskripsi"
                  rows={3}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {isKendalaSelected && (
                <>
                  {/* Kategori Kendala */}
                  <div className="mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Kategori Kendala
                    </label>
                    <select
                      value={formData.id_kategori_kendala || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_kategori_kendala: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                    >
                      <option value="">Pilih Kategori Kendala</option>
                      {kategoriKendalaList.map((kategori) => (
                        <option key={kategori.id} value={kategori.id}>
                          {kategori.kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kriteria Qty */}
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Kriteria Qty
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Produksi
                        </label>
                        <select
                          value={formData.id_kriteria_qty_produksi || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_qty_produksi: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Qty', 'Produksi').map(
                            (k) => (
                              <option key={k.id} value={k.id}>
                                {k.kriteria} ({k.value})
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          QC
                        </label>
                        <select
                          value={formData.id_kriteria_qty_qc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_qty_qc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Qty', 'QC').map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.kriteria} ({k.value})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Maintenance
                        </label>
                        <select
                          value={formData.id_kriteria_qty_mtc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_qty_mtc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Qty', 'Maintenance').map(
                            (k) => (
                              <option key={k.id} value={k.id}>
                                {k.kriteria} ({k.value})
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Kriteria Waktu */}
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Kriteria Waktu
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Produksi
                        </label>
                        <select
                          value={formData.id_kriteria_waktu_produksi || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_waktu_produksi: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Waktu', 'Produksi').map(
                            (k) => (
                              <option key={k.id} value={k.id}>
                                {k.kriteria} ({k.value})
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          QC
                        </label>
                        <select
                          value={formData.id_kriteria_waktu_qc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_waktu_qc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Waktu', 'QC').map(
                            (k) => (
                              <option key={k.id} value={k.id}>
                                {k.kriteria} ({k.value})
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Maintenance
                        </label>
                        <select
                          value={formData.id_kriteria_waktu_mtc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_waktu_mtc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian(
                            'Waktu',
                            'Maintenance',
                          ).map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.kriteria} ({k.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Kriteria Frekuensi */}
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Kriteria Frekuensi
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Produksi
                        </label>
                        <select
                          value={formData.id_kriteria_frekuensi_produksi || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_frekuensi_produksi: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian(
                            'Frekuensi',
                            'Produksi',
                          ).map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.kriteria} ({k.value})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          QC
                        </label>
                        <select
                          value={formData.id_kriteria_frekuensi_qc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_frekuensi_qc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian('Frekuensi', 'QC').map(
                            (k) => (
                              <option key={k.id} value={k.id}>
                                {k.kriteria} ({k.value})
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-black dark:text-white">
                          Maintenance
                        </label>
                        <select
                          value={formData.id_kriteria_frekuensi_mtc || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              id_kriteria_frekuensi_mtc: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Pilih Data</option>
                          {getKriteriaByTypeAndBagian(
                            'Frekuensi',
                            'Maintenance',
                          ).map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.kriteria} ({k.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Target Department */}
                  <div className="mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Target Department
                    </label>
                    <Select
                      isMulti
                      options={departments.map((dept) => ({
                        value: dept.id,
                        label: dept.nama_department,
                      }))}
                      value={departments
                        .filter((dept) =>
                          formData.target_department.includes(dept.id),
                        )
                        .map((dept) => ({
                          value: dept.id,
                          label: dept.nama_department,
                        }))}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          target_department: selected
                            ? selected.map((s) => s.value)
                            : [],
                        })
                      }
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Pilih Department"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded border border-stroke px-5 py-2.5 hover:shadow-1 dark:border-strokedark"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded bg-primary px-5 py-2.5 text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <TambahWasteModal
        show={showWasteModal}
        onClose={() => setShowWasteModal(false)}
        onSuccess={() => {
          // Optional: refresh data if needed
          fetchData();
        }}
      />
    </>
  );
};

export default MasterTableKodeProduksi;
