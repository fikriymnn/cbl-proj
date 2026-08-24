import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Tahapan {
  id?: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface Operator {
  id: number;
  nama: string;
  email: string;
  role: string;
  no: string;
  bagian: string;
}

interface ProduksiLKHProses {
  id: number;
  kode: string;
  deskripsi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  total_waktu: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  status: string;
  note: string;
  id_kode_produksi: number;
  is_final_result: boolean;
  proses?: string;
  operator?: Operator;
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

interface LKHWaste {
  id: number;
  id_jo: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kendala: number;
  kode_kendala: string;
  deskripsi_kendala: string;
  id_waste: number;
  kode_waste: string;
  deskripsi_waste: string;
  total_qty: number;
  id_produksi_lkh?: number;
  id_produksi_lkh_tahapan?: number;
  proses?: string;
}

interface ProduksiLKH {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  spesifikasi: string;
  status: string;
  operator?: Operator;
  produksi_lkh_proses: ProduksiLKHProses[];
}

interface LKHTahapanData {
  id: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  spesifikasi: string;
  status: string;
  id_tahapan: number;
  tahapan: Tahapan;
  produksi_lkh: ProduksiLKH[];
  produksi_lkh_proses: ProduksiLKHProses[];
  produksi_lkh_waste: LKHWaste[];
}

interface LKHResponse {
  data: LKHTahapanData[];
  total_page: number;
}

interface EditableProses {
  id: number;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
}

interface EditableWaste {
  id: number;
  id_waste: number;
  id_kendala: number;
  total_qty: number;
}

interface Option {
  value: string;
  label: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: '32px',
    fontSize: '0.75rem',
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: '0.75rem',
  }),
};

const ApproveSPVLKH: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lkhData, setLkhData] = useState<LKHTahapanData[]>([]);
  const [tahapanBawahan, setTahapanBawahan] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [qtyKurangQty, setQtyKurangQty] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // State for modal
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [selectedLKHForApproval, setSelectedLKHForApproval] =
    useState<LKHTahapanData | null>(null);

  // State for editable data
  const [editableData, setEditableData] = useState<EditableProses[]>([]);
  const [editableWasteData, setEditableWasteData] = useState<EditableWaste[]>(
    [],
  );

  // State for waste kendala list
  const [wasteKendalaList, setWasteKendalaList] = useState<WasteData[]>([]);

  useEffect(() => {
    getMe();
    fetchWasteKendala();
  }, []);

  const getMe = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const role = res.data.role;
      const userTahapanBawahan = res.data.tahapan_bawahan;

      setUserRole(role);

      if (!userTahapanBawahan || userTahapanBawahan === '') {
        setLkhData([]);
        setLoading(false);
        return;
      }

      setTahapanBawahan(userTahapanBawahan);
      fetchLKHData(userTahapanBawahan);
    } catch (error) {
      console.error('Error fetching me:', error);
      setLoading(false);
    }
  };

  const fetchLKHData = async (
    tahapanBawahanParam: string | null,
  ): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/lkhTahapan`;
    try {
      setLoading(true);
      const params: any = {
        status: 'request to spv',
      };

      if (tahapanBawahanParam !== null && tahapanBawahanParam !== '') {
        params.tahapan_bawahan = tahapanBawahanParam;
      }

      const res: AxiosResponse<LKHResponse> = await axios.get(url, {
        params,
        withCredentials: true,
      });

      setLkhData(res.data.data || []);
      console.log('Fetched LKH Tahapan data:', res.data);
    } catch (error) {
      console.error('Error fetching LKH data:', error);
      setLkhData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWasteKendala = async (): Promise<void> => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/produksi/wasteKendala`,
        {
          withCredentials: true,
        },
      );

      setWasteKendalaList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching waste kendala:', error);
    }
  };

  const openApprovalModal = (lkh: LKHTahapanData) => {
    setSelectedLKHForApproval(lkh);

    const initialEditableData = lkh.produksi_lkh_proses.map((proses) => ({
      id: proses.id,
      baik: proses.baik,
      rusak_sebagian: proses.rusak_sebagian,
      rusak_total: proses.rusak_total,
      pallet: proses.pallet,
    }));
    setEditableData(initialEditableData);

    const initialEditableWasteData =
      lkh.produksi_lkh_waste?.map((waste) => ({
        id: waste.id,
        id_waste: waste.id_waste,
        id_kendala: waste.id_kendala,
        total_qty: waste.total_qty,
      })) || [];
    setEditableWasteData(initialEditableWasteData);
    setQtyKurangQty(0);
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedLKHForApproval(null);
    setEditableData([]);
    setEditableWasteData([]);
    setQtyKurangQty(0);
  };

  const handleEditChange = (
    id: number,
    field: keyof EditableProses,
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    setEditableData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: numValue } : item,
      ),
    );
  };

  const handleWasteEditChange = (
    id: number,
    field: keyof EditableWaste,
    value: string | number,
  ) => {
    setEditableWasteData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === 'id_waste') {
          return {
            ...item,
            id_waste: Number(value),
            id_kendala: 0,
          };
        }

        return {
          ...item,
          [field]: typeof value === 'string' ? Number(value) : value,
        };
      }),
    );
  };

  const handleApprove = async (id: number): Promise<void> => {
    const confirmed = window.confirm(
      'Are you sure you want to approve this LKH?',
    );

    if (!confirmed) {
      return;
    }

    const approveUrl = `${
      import.meta.env.VITE_API_LINK
    }/produksi/lkhTahapan/approve/${id}`;

    const estimasiUrl = `${import.meta.env.VITE_API_LINK}/qc/estimasiKurangQty`;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));

      const body: any = {
        produksi_lkh_proses: editableData,
      };

      if (editableWasteData.length > 0) {
        body.produksi_lkh_waste = editableWasteData;
      }

      console.log('Approve Payload:', body);

      // 1. Always approve LKH
      await axios.put(approveUrl, body, {
        withCredentials: true,
      });

      // 2. Only hit estimasi kurang qty API if qty > 0
      if (qtyKurangQty > 0) {
        const estimasiBody = {
          id_produksi_lkh_tahapan: id,
          qty_kurang_qty: qtyKurangQty,
        };

        console.log('Estimasi Kurang Qty Payload:', estimasiBody);

        await axios.post(estimasiUrl, estimasiBody, {
          withCredentials: true,
        });
      } else {
        console.log('Qty Kurang Qty <= 0, skipping estimasi kurang qty API');
      }

      alert('LKH approved successfully!');
      closeApprovalModal();
      fetchLKHData(tahapanBawahan);
    } catch (error) {
      console.error('Error approving LKH:', error);
      alert('Failed to approve LKH. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
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

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'baru':
        return 'bg-blue-100 text-blue-800';
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'request to spv':
        return 'bg-orange-100 text-orange-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotals = (prosesList: ProduksiLKHProses[]) => {
    return prosesList
      .filter((proses) => proses.is_final_result === true)
      .reduce(
        (acc, proses) => {
          acc.baik += proses.baik || 0;
          acc.rusak_sebagian += proses.rusak_sebagian || 0;
          acc.rusak_total += proses.rusak_total || 0;
          acc.pallet += proses.pallet || 0;
          acc.total_waktu += parseInt(proses.total_waktu) || 0;
          return acc;
        },
        {
          baik: 0,
          rusak_sebagian: 0,
          rusak_total: 0,
          pallet: 0,
          total_waktu: 0,
        },
      );
  };

  const calculateEditableTotals = () => {
    if (!selectedLKHForApproval) return null;

    const totalWaktu = selectedLKHForApproval.produksi_lkh_proses.reduce(
      (acc, proses) => acc + (parseInt(proses.total_waktu) || 0),
      0,
    );

    const finalResultTotals = selectedLKHForApproval.produksi_lkh_proses
      .filter((proses) => Boolean(proses.is_final_result))
      .reduce(
        (acc, proses) => {
          const editedData = editableData.find((e) => e.id === proses.id);
          if (editedData) {
            acc.baik += editedData.baik || 0;
            acc.rusak_sebagian += editedData.rusak_sebagian || 0;
            acc.rusak_total += editedData.rusak_total || 0;
            acc.pallet += editedData.pallet || 0;
          }
          return acc;
        },
        { baik: 0, rusak_sebagian: 0, rusak_total: 0, pallet: 0 },
      );

    return { ...finalResultTotals, total_waktu: totalWaktu };
  };

  const getWasteOptions = (): Option[] => {
    return wasteKendalaList.map((waste) => ({
      value: String(waste.id),
      label: `${waste.kode} - ${waste.deskripsi}`,
    }));
  };

  const getKendalaOptions = (wasteId: number): Option[] => {
    if (!wasteId) return [];
    const selectedWaste = wasteKendalaList.find((w) => w.id === wasteId);
    if (!selectedWaste) return [];
    return selectedWaste.kendala.map((kendala) => ({
      value: String(kendala.id),
      label: `${kendala.kode} - ${kendala.deskripsi}`,
    }));
  };

  const getUniqueOperators = (prosesList: ProduksiLKHProses[]): Operator[] => {
    const seen = new Set<number>();
    const operators: Operator[] = [];
    for (const proses of prosesList) {
      if (proses.operator && !seen.has(proses.operator.id)) {
        seen.add(proses.operator.id);
        operators.push(proses.operator);
      }
    }
    return operators;
  };

  return (
    <div className="">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tahapan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Produksi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : lkhData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                lkhData.map((lkh) => {
                  const totals = calculateTotals(lkh.produksi_lkh_proses);

                  return (
                    <tr key={lkh.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {lkh.status === 'request to spv' && (
                          <button
                            onClick={() => openApprovalModal(lkh)}
                            disabled={actionLoading[lkh.id]}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[lkh.id] ? 'Loading...' : 'Approve'}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                        {lkh.no_jo || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.customer || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {lkh.produk || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.tahapan?.nama_tahapan || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {lkh.qty_jo || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        <div className="flex gap-1 flex-wrap">
                          <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                            ✓ {totals.baik}
                          </span>
                          <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                            ⚠ {totals.rusak_sebagian}
                          </span>
                          <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                            ✕ {totals.rusak_total}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            lkh.status,
                          )}`}
                        >
                          {lkh.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : lkhData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          lkhData.map((lkh) => {
            const totals = calculateTotals(lkh.produksi_lkh_proses);

            return (
              <div key={lkh.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {lkh.no_jo || '-'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {lkh.customer || '-'}
                    </div>
                    <span
                      className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                        lkh.status,
                      )}`}
                    >
                      {lkh.status}
                    </span>
                  </div>
                  {lkh.status === 'request to spv' && (
                    <button
                      onClick={() => openApprovalModal(lkh)}
                      disabled={actionLoading[lkh.id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {actionLoading[lkh.id] ? 'Loading...' : 'Approve'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Nama Produk:</span>
                    <div className="text-gray-900">{lkh.produk || '-'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs">Tahapan:</span>
                    <div className="text-gray-900">
                      {lkh.tahapan?.nama_tahapan || '-'}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs">Qty JO:</span>
                    <div className="text-gray-900">{lkh.qty_jo || '-'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs">
                      Total Produksi:
                    </span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                        ✓ Baik: {totals.baik}
                      </span>
                      <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">
                        ⚠ RS: {totals.rusak_sebagian}
                      </span>
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                        ✕ RT: {totals.rusak_total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLKHForApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Approval Detail - {selectedLKHForApproval.no_jo}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedLKHForApproval.customer} •{' '}
                    {selectedLKHForApproval.produk}
                  </p>
                </div>
                <button
                  onClick={closeApprovalModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    No IO/SO
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLKHForApproval.no_io} /{' '}
                    {selectedLKHForApproval.no_so}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Tahapan
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLKHForApproval.tahapan?.nama_tahapan || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Qty JO
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLKHForApproval.qty_jo}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Spesifikasi
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLKHForApproval.spesifikasi || '-'}
                  </p>
                </div>
              </div>

              {/* Operator Info Section */}
              {(() => {
                const operators = getUniqueOperators(
                  selectedLKHForApproval.produksi_lkh_proses,
                );
                if (operators.length === 0) return null;
                return (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a4 4 0 00-5-5M9 20H4v-2a4 4 0 015-5m6-4a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Operator ({operators.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {operators.map((op) => (
                        <div
                          key={op.id}
                          className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-2 shadow-sm"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {op.nama
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-gray-800 truncate">
                              {op.nama}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Editable Process Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Detail Proses (
                  {selectedLKHForApproval.produksi_lkh_proses?.length || 0}{' '}
                  Items)
                </h3>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Kode
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Deskripsi
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Operator
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Waktu
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Baik
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          RS
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          RT
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Pallet
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedLKHForApproval.produksi_lkh_proses?.map(
                        (proses) => {
                          const editedData = editableData.find(
                            (e) => e.id === proses.id,
                          );
                          return (
                            <tr key={proses.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs font-medium text-gray-900">
                                {proses.kode}
                                {proses.is_final_result && (
                                  <span
                                    className="ml-1 text-blue-600"
                                    title="Final Result"
                                  >
                                    ★
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900">
                                <div>{proses.deskripsi}</div>
                                {proses.proses && (
                                  <div className="text-gray-400 text-[10px] mt-0.5">
                                    {proses.proses}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {proses.operator ? (
                                  <div className="flex items-center gap-1.5 min-w-[120px]">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-800 leading-tight">
                                        {proses.operator.nama}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600">
                                <div>{formatDateTime(proses.waktu_mulai)}</div>
                                <div className="text-blue-600">
                                  {formatDuration(proses.total_waktu)}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editedData?.baik || 0}
                                  onChange={(e) =>
                                    handleEditChange(
                                      proses.id,
                                      'baik',
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editedData?.rusak_sebagian || 0}
                                  onChange={(e) =>
                                    handleEditChange(
                                      proses.id,
                                      'rusak_sebagian',
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editedData?.rusak_total || 0}
                                  onChange={(e) =>
                                    handleEditChange(
                                      proses.id,
                                      'rusak_total',
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editedData?.pallet || 0}
                                  onChange={(e) =>
                                    handleEditChange(
                                      proses.id,
                                      'pallet',
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                                    proses.status,
                                  )}`}
                                >
                                  {proses.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="max-w-xs text-xs text-gray-600 break-words">
                                  {proses.note || '-'}
                                </div>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editable Waste Table */}
              {selectedLKHForApproval.produksi_lkh_waste &&
                selectedLKHForApproval.produksi_lkh_waste.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Data Waste (
                      {selectedLKHForApproval.produksi_lkh_waste?.length || 0}{' '}
                      Items)
                    </h3>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Waste
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Kendala
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Total Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedLKHForApproval.produksi_lkh_waste.map(
                            (waste) => {
                              const editedWaste = editableWasteData.find(
                                (e) => e.id === waste.id,
                              );
                              const wasteOptions = getWasteOptions();
                              const kendalaOptions = getKendalaOptions(
                                editedWaste?.id_waste || waste.id_waste,
                              );

                              return (
                                <tr key={waste.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">
                                    <Select
                                      options={wasteOptions}
                                      value={
                                        editedWaste?.id_waste
                                          ? wasteOptions.find(
                                              (opt) =>
                                                opt.value ===
                                                String(editedWaste.id_waste),
                                            )
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          handleWasteEditChange(
                                            waste.id,
                                            'id_waste',
                                            Number(option.value),
                                          );
                                        }
                                      }}
                                      styles={selectStyles}
                                      placeholder="Pilih Waste"
                                      isClearable={false}
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Select
                                      options={kendalaOptions}
                                      value={
                                        editedWaste?.id_kendala
                                          ? kendalaOptions.find(
                                              (opt) =>
                                                opt.value ===
                                                String(editedWaste.id_kendala),
                                            )
                                          : null
                                      }
                                      onChange={(option) => {
                                        if (option) {
                                          handleWasteEditChange(
                                            waste.id,
                                            'id_kendala',
                                            Number(option.value),
                                          );
                                        }
                                      }}
                                      styles={selectStyles}
                                      placeholder="Pilih Kendala"
                                      isDisabled={
                                        !editedWaste?.id_waste &&
                                        !waste.id_waste
                                      }
                                      isClearable={false}
                                    />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      value={editedWaste?.total_qty || 0}
                                      onChange={(e) =>
                                        handleWasteEditChange(
                                          waste.id,
                                          'total_qty',
                                          e.target.value,
                                        )
                                      }
                                      className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Total Summary */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Total Keseluruhan (Final Results Only)
                  </h4>
                  <span className="text-xs text-blue-600">
                    ★ = Final Result
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(() => {
                    const totals = calculateEditableTotals();
                    return totals ? (
                      <>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                          <span className="text-xs font-medium text-gray-500 block">
                            Total Baik
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {totals.baik}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-yellow-200">
                          <span className="text-xs font-medium text-gray-500 block">
                            Total RS
                          </span>
                          <span className="text-lg font-bold text-yellow-600">
                            {totals.rusak_sebagian}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-red-200">
                          <span className="text-xs font-medium text-gray-500 block">
                            Total RT
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            {totals.rusak_total}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                          <span className="text-xs font-medium text-gray-500 block">
                            Total Pallet
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {totals.pallet}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-purple-200">
                          <span className="text-xs font-medium text-gray-500 block">
                            Total Waktu
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            {formatDuration(totals.total_waktu)}
                          </span>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
              {/* Qty Kurang Input */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Qty Kurang <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={qtyKurangQty}
                  onChange={(e) =>
                    setQtyKurangQty(parseInt(e.target.value) || 0)
                  }
                  className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeApprovalModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedLKHForApproval.id)}
                disabled={actionLoading[selectedLKHForApproval.id]}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading[selectedLKHForApproval.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveSPVLKH;
