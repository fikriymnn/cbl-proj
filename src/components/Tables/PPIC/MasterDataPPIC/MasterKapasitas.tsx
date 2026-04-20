import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'mei',
  'jun',
  'jul',
  'ags',
  'sep',
  'okt',
  'nov',
  'des',
] as const;
type Month = (typeof MONTHS)[number];

interface MesinOption {
  id: number;
  nama_mesin: string;
  kode_mesin?: string;
}

interface KapasitasItem {
  id: number;
  id_mesin: number;
  nama_mesin?: string;
  tahun: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  ags: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
  updatedAt?: string;
}

type MonthlyForm = Record<Month, number>;

interface FormData {
  id_mesin: number | '';
  tahun: number;
  monthly: MonthlyForm;
}

const defaultMonthly: MonthlyForm = {
  jan: 0,
  feb: 0,
  mar: 0,
  apr: 0,
  mei: 0,
  jun: 0,
  jul: 0,
  ags: 0,
  sep: 0,
  okt: 0,
  nov: 0,
  des: 0,
};

function MasterKapasitas() {
  const currentYear = new Date().getFullYear();

  const [isLoading, setIsLoading] = useState(false);
  const [kapasitasData, setKapasitasData] = useState<KapasitasItem[]>([]);
  const [mesinMaster, setMesinMaster] = useState<MesinOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<number>(currentYear);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KapasitasItem | null>(null);

  const [formData, setFormData] = useState<FormData>({
    id_mesin: '',
    tahun: currentYear,
    monthly: { ...defaultMonthly },
  });

  useEffect(() => {
    getMasterKapasitas();
    getMasterMesin();
  }, [selectedTahun]);

  async function getMasterKapasitas() {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/kapasitasMesin`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: { tahun: selectedTahun },
        withCredentials: true,
      });
      console.log('kapasitas response:', res.data);
      // Adjust key based on actual response shape after console
      setKapasitasData(res.data.data || res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      console.log('mesin list:', res.data.data);
      setMesinMaster(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function addKapasitas() {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/kapasitasMesin`;
    try {
      setIsLoading(true);
      const body = {
        id_mesin: formData.id_mesin,
        tahun: formData.tahun,
        ...formData.monthly,
      };
      console.log('POST body:', body);
      await axios.post(url, body, { withCredentials: true });
      handleCloseModal();
      getMasterKapasitas();
    } catch (error) {
      console.log(error);
      alert('Failed to add data');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateKapasitas() {
    if (!editingItem) return;
    const url = `${import.meta.env.VITE_API_LINK}/ppic/kapasitasMesin/${
      editingItem.id
    }`;
    try {
      setIsLoading(true);
      const body = {
        id_mesin: formData.id_mesin,
        tahun: formData.tahun,
        ...formData.monthly,
      };
      console.log('PUT body:', body);
      await axios.put(url, body, { withCredentials: true });
      handleCloseModal();
      getMasterKapasitas();
    } catch (error) {
      console.log(error);
      alert('Failed to update data');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenEdit(item: KapasitasItem) {
    setEditingItem(item);
    setFormData({
      id_mesin: item.id_mesin,
      tahun: item.tahun,
      monthly: {
        jan: item.jan,
        feb: item.feb,
        mar: item.mar,
        apr: item.apr,
        mei: item.mei,
        jun: item.jun,
        jul: item.jul,
        ags: item.ags,
        sep: item.sep,
        okt: item.okt,
        nov: item.nov,
        des: item.des,
      },
    });
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setFormData({
      id_mesin: '',
      tahun: currentYear,
      monthly: { ...defaultMonthly },
    });
  }

  function handleMonthChange(month: Month, value: string) {
    setFormData((prev) => ({
      ...prev,
      monthly: { ...prev.monthly, [month]: parseInt(value) || 0 },
    }));
  }

  function formatNumber(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
  }

  function getMesinName(id_mesin: number) {
    return mesinMaster.find((m) => m.id === id_mesin)?.nama_mesin || '-';
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const modalContent = (isEdit: boolean) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Edit Kapasitas Mesin' : 'Tambah Data Kapasitas'}
          </h3>
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Mesin & Tahun row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mesin
            </label>
            <select
              className="border rounded w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.id_mesin}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  id_mesin: parseInt(e.target.value),
                }))
              }
              required
            >
              <option value="">Pilih Mesin</option>
              {mesinMaster.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_mesin}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tahun
            </label>
            <select
              className="border rounded w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.tahun}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tahun: parseInt(e.target.value),
                }))
              }
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly inputs grid */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Kapasitas per Bulan
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MONTHS.map((month) => (
              <div key={month}>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                  {month}
                </label>
                <input
                  type="number"
                  className="border rounded w-full py-1.5 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.monthly[month]}
                  onChange={(e) => handleMonthChange(month, e.target.value)}
                  min={0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleCloseModal}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? updateKapasitas : addKapasitas}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="overflow-x-auto">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Master Kapasitas Mesin</h2>
          <div className="flex items-center gap-3">
            {/* Year filter */}
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              onClick={() => setShowAddModal(true)}
            >
              Tambah Data
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Nama Mesin
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Tahun
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m}
                    className="px-3 py-3 text-right font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {m}
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kapasitasData.length > 0 ? (
                kapasitasData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">
                      {item.nama_mesin || getMesinName(item.id_mesin)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                      {item.tahun}
                    </td>
                    {MONTHS.map((m) => (
                      <td
                        key={m}
                        className="px-3 py-3 whitespace-nowrap text-right text-gray-700"
                      >
                        {formatNumber(item[m])}
                      </td>
                    ))}
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={MONTHS.length + 4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && modalContent(false)}
      {showEditModal && editingItem && modalContent(true)}
    </main>
  );
}

export default MasterKapasitas;
