import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface UserInfo {
  id: number;
  nama: string;
  email: string;
  role: string;
  bagian: string;
}

interface EstimasiKurangQtyItem {
  id: number;
  id_produksi_lkh_tahapan: number;
  id_jo: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_tahapan: number;
  id_request: number;
  id_approve: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  qty_kurang_qty: number;
  qty_baik?: number;
  qty_rusak_sebagian?: number;
  qty_rusak_total?: number;
  qty_total?: number;
  spesifikasi: string;
  tgl_approve: string | null;
  tgl_request: string;
  note?: string | null;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  tahapan?: Tahapan;
  user_request?: UserInfo;
  user_approve?: UserInfo;
}

interface EstimasiKurangQtyResponse {
  status: number;
  success: boolean;
  data: EstimasiKurangQtyItem[];
  total_page?: number;
}

interface EstimasiKurangQtyDetailResponse {
  status: number;
  success: boolean;
  data: EstimasiKurangQtyItem;
}

const EstimasiKurangQtyProduksi: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [listData, setListData] = useState<EstimasiKurangQtyItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  // tahapan_bawahan comes from /me, mirroring ApproveSPVLKH
  const [tahapanBawahan, setTahapanBawahan] = useState<number[] | null>(null);
  const [meLoaded, setMeLoaded] = useState<boolean>(false);

  const [actionLoading, setActionLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // Modal / detail state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] =
    useState<EstimasiKurangQtyItem | null>(null);

  // Waste by JO state (simplified inline panel inside the detail modal)
  const [wasteMaster, setWasteMaster] = useState<any>(null);
  const [wasteByJo, setWasteByJo] = useState<any>(null);
  const [wasteLoading, setWasteLoading] = useState<boolean>(false);
  const [showWaste, setShowWaste] = useState<boolean>(false);

  useEffect(() => {
    getMe();
    getWasteMaster();
  }, []);

  useEffect(() => {
    if (meLoaded) {
      fetchListData();
    }
  }, [page, limit, meLoaded]);

  const getMe = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const rawTahapanBawahan = res.data.tahapan_bawahan;

      if (!rawTahapanBawahan || rawTahapanBawahan === '') {
        setTahapanBawahan(null);
      } else if (Array.isArray(rawTahapanBawahan)) {
        setTahapanBawahan(rawTahapanBawahan);
      } else {
        // tahapan_bawahan is returned as a stringified array, e.g. "[3,1,4]"
        try {
          const parsed = JSON.parse(rawTahapanBawahan);
          setTahapanBawahan(Array.isArray(parsed) ? parsed : null);
        } catch {
          setTahapanBawahan(null);
        }
      }
    } catch (error) {
      console.error('Error fetching me:', error);
    } finally {
      setMeLoaded(true);
    }
  };

  const fetchListData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/produksi/estimasiKurangQty`;
    try {
      setLoading(true);
      const params: any = { page, limit };

      if (tahapanBawahan && tahapanBawahan.length > 0) {
        params.tahapan_bawahan = JSON.stringify(tahapanBawahan);
      }

      const res: AxiosResponse<EstimasiKurangQtyResponse> = await axios.get(
        url,
        {
          params,
          withCredentials: true,
        },
      );

      const responseData = Array.isArray(res.data.data) ? res.data.data : [];
      setListData(responseData);
      setTotalPages(res.data.total_page || 0);
    } catch (error) {
      console.error('Error fetching estimasi kurang qty (Produksi):', error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit: number): void => {
    setLimit(newLimit);
    setPage(1);
  };

  const openDetailModal = async (id: number): Promise<void> => {
    setShowModal(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    setWasteByJo(null);
    setShowWaste(false);

    const url = `${
      import.meta.env.VITE_API_LINK
    }/produksi/estimasiKurangQty/${id}`;
    try {
      const res: AxiosResponse<EstimasiKurangQtyDetailResponse> =
        await axios.get(url, { withCredentials: true });
      setSelectedDetail(res.data.data);
    } catch (error) {
      console.error(
        'Error fetching estimasi kurang qty detail (Produksi):',
        error,
      );
      alert('Failed to load detail. Please try again.');
      setShowModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedDetail(null);
    setWasteByJo(null);
    setShowWaste(false);
  };

  const handleApprove = async (id: number): Promise<void> => {
    const confirmed = window.confirm(
      'Are you sure you want to approve this request?',
    );
    if (!confirmed) return;

    const url = `${
      import.meta.env.VITE_API_LINK
    }/produksi/estimasiKurangQty/approve/${id}`;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await axios.put(url, {}, { withCredentials: true });
      alert('Request approved successfully!');
      closeModal();
      fetchListData();
    } catch (error) {
      console.error('Error approving estimasi kurang qty (Produksi):', error);
      alert('Failed to approve. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Fetches the waste master list once (used to build the waste-by-JO report)
  const getWasteMaster = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/produksi/wasteKendalaFormating`;
    try {
      const res = await axios.get(url, {});
      setWasteMaster(res.data.waste);
    } catch (error) {
      console.error('Error fetching waste master:', error);
    }
  };

  // Same as the regular waste report, but scoped to a single JO instead of a date range
  const fetchWasteByJo = async (
    no_jo: string,
    id_jo: number,
  ): Promise<void> => {
    setWasteLoading(true);
    setWasteByJo(null);
    try {
      const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`;
      const url = `${import.meta.env.VITE_API_LINK}/reportWasteByJo`;

      const res2 = await axios.get(url2, {
        params: { no_jo, id_jo },
      });

      const res = await axios.post(
        url,
        {
          data_waste_master: wasteMaster,
          data_waste_p1: res2.data,
          no_jo,
          id_jo,
        },
        { withCredentials: true },
      );

      setWasteByJo(res.data);
    } catch (error) {
      console.error('Error fetching waste by JO:', error);
      setWasteByJo(null);
    } finally {
      setWasteLoading(false);
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID');
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'waiting':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPending = (status: string): boolean =>
    status?.toLowerCase() !== 'approved' &&
    status?.toLowerCase() !== 'rejected';

  const renderUserBadge = (
    user: UserInfo | undefined,
    label: string,
    date: string | null | undefined,
  ) => {
    if (!user) {
      return (
        <div>
          <span className="text-xs text-gray-500">{label}:</span>
          <div className="text-xs text-gray-400">-</div>
        </div>
      );
    }
    return (
      <div>
        <span className="text-xs text-gray-500">{label}:</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            {user.nama
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-800 truncate">
              {user.nama}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatDateTime(date)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Renders the simplified, collapsible "waste by JO" panel shown inside the detail modal
  const renderWastePanel = () => {
    if (!selectedDetail) return null;

    const wasteJoData = wasteByJo?.dataWasteByJo?.[0] ?? wasteByJo;
    const defects = wasteJoData?.defects || [];
    const hasData = defects.length > 0 || !!wasteJoData?.defectsByKategori;

    return (
      <div className="border border-gray-200 rounded-lg p-3">
        <button
          type="button"
          onClick={() => {
            if (!showWaste) {
              fetchWasteByJo(selectedDetail.no_jo, selectedDetail.id_jo);
            }
            setShowWaste((prev) => !prev);
          }}
          className="flex items-center justify-between w-full text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <span>Waste JO {selectedDetail.no_jo}</span>
          <span className="text-xs">
            {showWaste ? 'Sembunyikan ▲' : 'Lihat ▼'}
          </span>
        </button>

        {showWaste && (
          <div className="mt-3">
            {wasteLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : hasData ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {['POTONG', 'CETAK', 'COATING', 'POND', 'LEM', 'LIPAT'].map(
                    (kat) => (
                      <div
                        key={kat}
                        className="text-center bg-gray-50 rounded p-2"
                      >
                        <div className="text-[10px] text-gray-500">{kat}</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatNumber(
                            wasteJoData?.defectsByKategori?.[kat]
                              ?.total_defect ?? 0,
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Kode Waste
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-right">
                          Total Defect
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-left">
                          Kendala
                        </th>
                        <th className="border border-gray-200 px-2 py-1 text-right">
                          Defect By Kendala
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...defects]
                        .sort(
                          (a: any, b: any) =>
                            (b.total_defect ?? 0) - (a.total_defect ?? 0),
                        )
                        .map((d: any, idx: number) => {
                          const kendalaList = Array.isArray(d.kendala)
                            ? d.kendala
                            : [];

                          if (kendalaList.length === 0) {
                            return (
                              <tr
                                key={idx}
                                className="border-b border-gray-200"
                              >
                                <td className="border border-gray-200 px-2 py-1">
                                  {d.kode_waste} - {d.waste_desc}
                                </td>
                                <td className="border border-gray-200 px-2 py-1 text-right">
                                  {formatNumber(d.total_defect)}
                                </td>
                                <td
                                  className="border border-gray-200 px-2 py-1 text-center text-gray-400"
                                  colSpan={2}
                                >
                                  Tidak ada data kendala
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <React.Fragment key={idx}>
                              {[...kendalaList]
                                .sort(
                                  (a: any, b: any) =>
                                    (b.calculated_defect ?? 0) -
                                    (a.calculated_defect ?? 0),
                                )
                                .map((k: any, ki: number) => (
                                  <tr
                                    key={`${idx}-${ki}`}
                                    className="border-b border-gray-200"
                                  >
                                    {ki === 0 && (
                                      <>
                                        <td
                                          rowSpan={kendalaList.length}
                                          className="border border-gray-200 px-2 py-1 align-top"
                                        >
                                          {d.kode_waste} - {d.waste_desc}
                                        </td>
                                        <td
                                          rowSpan={kendalaList.length}
                                          className="border border-gray-200 px-2 py-1 text-right align-top"
                                        >
                                          {formatNumber(d.total_defect)}
                                        </td>
                                      </>
                                    )}
                                    <td className="border border-gray-200 px-2 py-1">
                                      {k.kategori_kendala} - {k.kode_kendala} -{' '}
                                      {k.kendala_desc}
                                    </td>
                                    <td className="border border-gray-200 px-2 py-1 text-right">
                                      {formatNumber(k.calculated_defect)}
                                    </td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                Tidak ada data waste untuk JO ini.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  No JO
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Tahapan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Qty Kurang
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Diminta Oleh
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
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
              ) : listData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-gray-500 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                listData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <button
                        onClick={() => openDetailModal(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs"
                      >
                        Detail
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                      {item.no_jo || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.customer || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                      {item.produk || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.tahapan?.nama_tahapan || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">
                        {formatNumber(item.qty_kurang_qty)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {renderUserBadge(
                        item.user_request,
                        'Request',
                        item.tgl_request,
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === pageSize
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : listData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          listData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {item.no_jo || '-'}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.customer || '-'}
                  </div>
                  <span
                    className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <button
                  onClick={() => openDetailModal(item.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap"
                >
                  Detail
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Produk:</span>
                  <div className="text-gray-900">{item.produk || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Tahapan:</span>
                  <div className="text-gray-900">
                    {item.tahapan?.nama_tahapan || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Qty Kurang:</span>
                  <div className="text-orange-700 font-medium">
                    {formatNumber(item.qty_kurang_qty)}
                  </div>
                </div>
                {renderUserBadge(
                  item.user_request,
                  'Diminta oleh',
                  item.tgl_request,
                )}
              </div>
            </div>
          ))
        )}

        <div className="w-full flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    limit === pageSize
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(e, i) => setPage(i)}
              size="small"
            />
          </Stack>
        </div>
      </div>

      {/* Detail / Approve Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Detail Estimasi Kurang Qty
                {selectedDetail ? ` - ${selectedDetail.no_jo}` : ''}
              </h2>
              <button
                onClick={closeModal}
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

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        No JO
                      </span>
                      <p className="text-gray-900">{selectedDetail.no_jo}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        No IO / SO
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.no_io} / {selectedDetail.no_so}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Customer
                      </span>
                      <p className="text-gray-900">{selectedDetail.customer}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Produk
                      </span>
                      <p className="text-gray-900">{selectedDetail.produk}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Tahapan
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.tahapan?.nama_tahapan || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Spesifikasi
                      </span>
                      <p className="text-gray-900">
                        {selectedDetail.spesifikasi || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty JO
                      </span>
                      <p className="text-gray-900">
                        {formatNumber(selectedDetail.qty_jo)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Kurang
                      </span>
                      <p className="text-orange-700 font-semibold">
                        {formatNumber(selectedDetail.qty_kurang_qty)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Baik
                      </span>
                      <p className="text-green-700 font-semibold">
                        {formatNumber(selectedDetail.qty_baik)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Rusak Sebagian
                      </span>
                      <p className="text-yellow-700 font-semibold">
                        {formatNumber(selectedDetail.qty_rusak_sebagian)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Rusak Total
                      </span>
                      <p className="text-red-700 font-semibold">
                        {formatNumber(selectedDetail.qty_rusak_total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Qty Total
                      </span>
                      <p className="text-gray-900 font-semibold">
                        {formatNumber(selectedDetail.qty_total)}
                      </p>
                    </div>
                  </div>

                  {renderWastePanel()}

                  {selectedDetail.note && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-xs font-medium text-gray-500">
                        Note (PPIC)
                      </span>
                      <p className="text-sm text-gray-900">
                        {selectedDetail.note}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50 rounded-lg">
                    {renderUserBadge(
                      selectedDetail.user_request,
                      'Diminta oleh',
                      selectedDetail.tgl_request,
                    )}
                    {renderUserBadge(
                      selectedDetail.user_approve,
                      'Disetujui oleh',
                      selectedDetail.tgl_approve,
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                        selectedDetail.status,
                      )}`}
                    >
                      {selectedDetail.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">
                  Data not found.
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedDetail && isPending(selectedDetail.status) && (
                <button
                  onClick={() => handleApprove(selectedDetail.id)}
                  disabled={actionLoading[selectedDetail.id]}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading[selectedDetail.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimasiKurangQtyProduksi;
