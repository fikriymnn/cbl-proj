import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WasteTable from './WasteTable';

const API_BASE = import.meta.env.VITE_API_LINK;

interface Tahapan {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Mesin {
  id: number;
  nama_mesin: string;
  kode_mesin: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Operator {
  id: number;
  uuid: string;
  nama: string;
  no: string;
  email: string;
  role: string;
  bagian: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UserApprove {
  id: number;
  uuid: string;
  nama: string;
  no: string;
  email: string;
  role: string;
  bagian: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProduksiLKHTahapan {
  id: number;
  id_jo?: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_tahapan: number;
  id_approve: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  qty_druk: number | null;
  spesifikasi: string;
  tgl_kirim: string;
  tgl_approve: string | null;
  status: string;
  is_active: boolean;
  index: number;
  createdAt: string;
  updatedAt: string;
  tahapan?: Tahapan;
  user_approve?: UserApprove;
}

interface ProduksiLKHProses {
  id_jo: unknown;
  id: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kode_produksi: number;
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
  proses: string;
  is_final_result: boolean;
  tahapan?: Tahapan;
  mesin?: Mesin;
  operator?: Operator;
}

interface ProduksiLKHWaste {
  id: number;
  id_jo: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kendala: number;
  id_waste: number;
  kode_kendala: string;
  kode_waste: string;
  deskripsi_kendala: string;
  deskripsi_waste: string;
  total_qty: number;
  proses: string;
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  tahapan?: Tahapan;
  mesin?: Mesin;
  operator?: Operator;
}

interface LKHAllDataItem {
  id: number;
  id_jo?: number;
  id_io: number;
  id_so: number;
  id_customer: number;
  id_produk: number;
  id_approve_jo?: number;
  id_create_jo?: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty: number;
  qty_druk: number | null;
  qty_lp?: number;
  po_qty?: number;
  spesifikasi: string;
  tgl_kirim: string;
  tgl_pembuatan_jo?: string;
  tgl_approve_jo?: string;
  status: string;
  status_jo?: string;
  status_proses?: string;
  status_kalkulasi?: string;
  tipe_jo?: string;
  toleransi?: string;
  standar_warna?: string;
  label?: string;
  keterangan_pengerjaan?: string;
  alamat_pengiriman?: string;
  note_reject?: string | null;
  stok_fg?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  produksi_lkh_proses: ProduksiLKHProses[];
  produksi_lkh_waste: ProduksiLKHWaste[];
  produksi_lkh_tahapan?: ProduksiLKHTahapan[];
  tahapan?: Tahapan;
}

interface LKHDetailPopupProps {
  lkhData: LKHAllDataItem;
  onClose: () => void;
}

interface ApprovalLog {
  userName: string;
  tahapanName: string;
  approvalDate: string;
  index: number;
}

// ---- Tambah Bahan types -------------------------------------------------
// NOTE: these are intentionally kept local/loose (not imported from your
// existing Tambahbahan.types.ts) so this file doesn't depend on the exact
// shape of that module. If you already have shared types, feel free to
// swap these out for your own TambahBahanPersiapanDetail /
// TambahBahanPemakaianDetail types.

interface TambahBahanUserInfo {
  id: number;
  nama: string;
  role?: string;
  bagian?: string;
}

interface TambahBahanDefect {
  id: number;
  kode: string;
  deskripsi: string;
  qty_tambah_bahan?: number;
  qty_tambah_bahan_lp?: number;
  qty_tambah_bahan_druk?: number;
}

interface TambahBahanPemakaianDetailItem {
  id: number;
  id_jo: number;
  no_jo?: string;
  nama_kertas?: string;
  note?: string | null;
  note_gudang?: string | null;
  note_qc?: string | null;
  qty_tambah_bahan_lp?: number;
  qty_tambah_bahan_druk?: number;
  status: string;
  status_tiket?: string;
  createdAt: string;
  tgl_request?: string | null;
  tgl_qc?: string | null;
  tgl_gudang?: string | null;
  user_request?: TambahBahanUserInfo;
  user_qc?: TambahBahanUserInfo;
  user_gudang?: TambahBahanUserInfo;
  tambah_bahan_pemakaian_defect?: TambahBahanDefect[];
}

interface TambahBahanPersiapanDetailItem
  extends Omit<
    TambahBahanPemakaianDetailItem,
    'tambah_bahan_pemakaian_defect'
  > {
  qty_pakai_tambah_bahan_lp?: number;
  qty_pakai_tambah_bahan_druk?: number;
  note_qc_pemakaian?: string | null;
  tgl_pakai?: string | null;
  tgl_qc_pemakaian?: string | null;
  user_qc_pemakaian?: TambahBahanUserInfo;
  tambah_bahan_persiapan_defect?: TambahBahanDefect[];
}

const LKHDetailPopup: React.FC<LKHDetailPopupProps> = ({
  lkhData,
  onClose,
}) => {
  const MAX_COLUMNS = 5; // Maximum 5 tahapan per row

  // ---- Tambah Bahan state ----
  const [tambahBahanPemakaian, setTambahBahanPemakaian] = useState<
    TambahBahanPemakaianDetailItem[]
  >([]);
  const [tambahBahanPersiapan, setTambahBahanPersiapan] = useState<
    TambahBahanPersiapanDetailItem[]
  >([]);
  const [loadingTambahBahan, setLoadingTambahBahan] = useState<boolean>(false);

  const firstProsesIdJo = lkhData.produksi_lkh_proses?.[0]?.id_jo;

  useEffect(() => {
    fetchTambahBahanData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstProsesIdJo]);

  // Flow:
  // 1. Call the list endpoints (same ones HistoryTambahBahan uses) filtered
  //    by this JO's id_jo, so we only get tickets tied to this LKH.
  // 2. From that list, grab each ticket's `id`.
  // 3. Call the get-by-id endpoint for each id to get full detail
  //    (defects + user info included).
  const fetchTambahBahanData = async (): Promise<void> => {
    const idJo = lkhData.produksi_lkh_proses?.[0]?.id_jo;

    if (!idJo) {
      setTambahBahanPemakaian([]);
      setTambahBahanPersiapan([]);
      return;
    }

    setLoadingTambahBahan(true);
    try {
      const [pemakaianListRes, persiapanListRes] = await Promise.all([
        axios.get(`${API_BASE}/gudangRM/tambahBahanPemakaian`, {
          params: {
            id_jo: idJo,
            status_tiket: 'history',
          },
          withCredentials: true,
        }),
        axios.get(`${API_BASE}/gudangRM/tambahBahanPersiapan`, {
          params: {
            id_jo: idJo,
            status_tiket: 'history',
          },
          withCredentials: true,
        }),
      ]);

      const pemakaianIds: number[] = (pemakaianListRes.data?.data || []).map(
        (item: any) => item.id,
      );
      const persiapanIds: number[] = (persiapanListRes.data?.data || []).map(
        (item: any) => item.id,
      );

      const [pemakaianDetailRes, persiapanDetailRes] = await Promise.all([
        Promise.all(
          pemakaianIds.map((id) =>
            axios.get(`${API_BASE}/gudangRM/tambahBahanPemakaian/${id}`, {
              withCredentials: true,
            }),
          ),
        ),
        Promise.all(
          persiapanIds.map((id) =>
            axios.get(`${API_BASE}/gudangRM/tambahBahanPersiapan/${id}`, {
              withCredentials: true,
            }),
          ),
        ),
      ]);

      setTambahBahanPemakaian(
        pemakaianDetailRes.map((res) => res.data?.data || res.data),
      );
      setTambahBahanPersiapan(
        persiapanDetailRes.map((res) => res.data?.data || res.data),
      );
    } catch (error) {
      console.error('Error fetching tambah bahan data:', error);
      setTambahBahanPemakaian([]);
      setTambahBahanPersiapan([]);
    } finally {
      setLoadingTambahBahan(false);
    }
  };

  const tambahBahanStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      'menunggu qc': 'Menunggu QC',
      'approve qc': 'Approve QC',
      'menunggu gudang': 'Menunggu Gudang',
      'approve gudang': 'Approve Gudang',
      'menunggu qc pemakaian': 'Menunggu QC Pemakaian',
      done: 'Selesai',
      reject: 'Ditolak',
    };
    return map[status?.toLowerCase()] || status || '-';
  };

  const tambahBahanStatusColor = (status: string): string => {
    const s = status?.toLowerCase() || '';
    if (s === 'done') return 'bg-green-100 text-green-700';
    if (s.includes('reject')) return 'bg-red-100 text-red-700';
    if (s.includes('menunggu')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Format number with thousand separator
  const formatNumber = (num: number): string => {
    return (num || 0).toLocaleString('id-ID');
  };

  const formatDuration = (totalSeconds: number | string): string => {
    const seconds =
      typeof totalSeconds === 'string' ? parseInt(totalSeconds) : totalSeconds;

    if (isNaN(seconds) || seconds < 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    // Check if date is invalid
    if (isNaN(date.getTime())) return '-';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const getApprovalLogs = (): ApprovalLog[] => {
    if (
      !lkhData.produksi_lkh_tahapan ||
      lkhData.produksi_lkh_tahapan.length === 0
    ) {
      return [];
    }

    return (
      lkhData.produksi_lkh_tahapan
        .filter((tahapan) => tahapan.user_approve && tahapan.tahapan)
        .map((tahapan) => ({
          userName: tahapan.user_approve!.nama,
          tahapanName: tahapan.tahapan!.nama_tahapan,
          approvalDate: tahapan.tgl_approve || '-', // Changed to '-' for better display
          index: tahapan.index,
        }))
        // Remove this filter or modify it to show all approvals
        // .filter((log) => log.approvalDate !== '')
        .sort((a, b) => a.index - b.index)
    );
  };
  // Group processes by tahapan and calculate totals
  const getTahapanSummary = () => {
    const tahapanMap = new Map<
      string,
      {
        tahapanName: string;
        setting: number;
        produksi: number;
        off: number;
        kendala: number;
        maintenance: number;
        baik: number;
        rusak_sebagian: number;
        rusak_total: number;
        total_qty: number;
      }
    >();

    // Sort by waktu_mulai
    const sortedProses = [...lkhData.produksi_lkh_proses].sort(
      (a, b) =>
        new Date(a.waktu_mulai).getTime() - new Date(b.waktu_mulai).getTime(),
    );

    sortedProses.forEach((proses) => {
      const tahapanKey = proses.tahapan?.nama_tahapan || 'Unknown';

      if (!tahapanMap.has(tahapanKey)) {
        tahapanMap.set(tahapanKey, {
          tahapanName: tahapanKey,
          setting: 0,
          produksi: 0,
          off: 0,
          kendala: 0,
          maintenance: 0,
          baik: 0,
          rusak_sebagian: 0,
          rusak_total: 0,
          total_qty: 0,
        });
      }

      const summary = tahapanMap.get(tahapanKey)!;
      const waktuInSeconds = parseInt(proses.total_waktu);

      // Categorize by proses type
      switch (proses.proses?.toLowerCase()) {
        case 'setting':
          summary.setting += waktuInSeconds;
          break;
        case 'produksi':
          summary.produksi += waktuInSeconds;
          break;
        case 'off':
          summary.off += waktuInSeconds;
          break;
        case 'kendala':
          summary.kendala += waktuInSeconds;
          break;
        case 'maintenance':
          summary.maintenance += waktuInSeconds;
          break;
      }

      // Only sum quantities if is_final_result is true
      if (proses.is_final_result) {
        summary.baik += proses.baik;
        summary.rusak_sebagian += proses.rusak_sebagian;
        summary.rusak_total += proses.rusak_total;
        summary.total_qty =
          summary.baik + summary.rusak_sebagian + summary.rusak_total;
      }
    });

    return Array.from(tahapanMap.values());
  };

  const handlePrint = () => {
    window.print();
  };

  const tahapanSummary = getTahapanSummary();
  const approvalLogs = getApprovalLogs();

  // Split tahapan into chunks of MAX_COLUMNS
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const tahapanChunks = chunkArray(tahapanSummary, MAX_COLUMNS);

  // Render summary table for a chunk - Compact version with header on top
  const renderSummaryTable = (
    chunk: typeof tahapanSummary,
    chunkIndex: number,
  ) => (
    <div key={chunkIndex} className="mb-4 inline-block mr-4">
      {chunk.map((summary, idx) => (
        <table
          key={idx}
          className="border-collapse border border-gray-300 text-xs inline-block mr-3 align-top"
        >
          <thead>
            <tr>
              <th
                className="border border-gray-300 px-4 py-2 text-center font-bold bg-blue-600 text-white"
                colSpan={2}
              >
                {summary.tahapanName}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Setting */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold w-32">
                Setting
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center w-28">
                {formatDuration(summary.setting)}
              </td>
            </tr>

            {/* Produksi */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Produksi
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.produksi)}
              </td>
            </tr>

            {/* Off */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Off
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.off)}
              </td>
            </tr>

            {/* Kendala */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Kendala
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.kendala)}
              </td>
            </tr>

            {/* Maintenance */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Maintenance
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatDuration(summary.maintenance)}
              </td>
            </tr>

            {/* Baik */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Baik
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.baik)}
              </td>
            </tr>

            {/* Rusak Sebagian */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Rusak Sebagian
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.rusak_sebagian)}
              </td>
            </tr>

            {/* Rusak Total */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Rusak Total
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center">
                {formatNumber(summary.rusak_total)}
              </td>
            </tr>

            {/* Total Qty */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-green-100 font-bold">
                Total Qty
              </td>
              <td className="border border-gray-300 px-3 py-1 text-center font-bold text-blue-600">
                {formatNumber(summary.total_qty)}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );

  // Render one Tambah Bahan ticket as a card/table, following the same
  // "header on top, key-value rows below" template as renderSummaryTable.
  const renderTambahBahanCard = (
    item: TambahBahanPemakaianDetailItem | TambahBahanPersiapanDetailItem,
    type: 'pemakaian' | 'persiapan',
  ) => {
    const isPersiapan = type === 'persiapan';
    const persiapanItem = item as TambahBahanPersiapanDetailItem;
    const defects: TambahBahanDefect[] = isPersiapan
      ? persiapanItem.tambah_bahan_persiapan_defect || []
      : (item as TambahBahanPemakaianDetailItem)
          .tambah_bahan_pemakaian_defect || [];
    const headerColor = isPersiapan ? 'bg-teal-600' : 'bg-blue-600';

    return (
      <div
        key={`${type}-${item.id}`}
        className="inline-block align-top mr-4 mb-4"
      >
        <table className="border-collapse border border-gray-300 text-xs">
          <thead>
            <tr>
              <th
                colSpan={2}
                className={`border border-gray-300 px-4 py-2 text-center font-bold text-white ${headerColor}`}
              >
                {item.no_jo || '-'} · {isPersiapan ? 'Persiapan' : 'Pemakaian'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold w-36">
                Kertas
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left w-52">
                {item.nama_kertas || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Qty Tambah LP
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {formatNumber(item.qty_tambah_bahan_lp || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Qty Tambah Druk
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {formatNumber(item.qty_tambah_bahan_druk || 0)}
              </td>
            </tr>

            {isPersiapan && (
              <>
                <tr>
                  <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                    Qty Pakai LP
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-left">
                    {formatNumber(persiapanItem.qty_pakai_tambah_bahan_lp || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                    Qty Pakai Druk
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-left">
                    {formatNumber(
                      persiapanItem.qty_pakai_tambah_bahan_druk || 0,
                    )}
                  </td>
                </tr>
              </>
            )}

            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Status
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${tambahBahanStatusColor(
                    item.status,
                  )}`}
                >
                  {tambahBahanStatusLabel(item.status)}
                </span>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Note
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.note || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Note QC
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.note_qc || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                Note Gudang
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.note_gudang || '-'}
              </td>
            </tr>
            {isPersiapan && persiapanItem.note_qc_pemakaian && (
              <tr>
                <td className="border border-gray-300 px-3 py-1 text-left bg-gray-100 font-semibold">
                  Note QC Pemakaian
                </td>
                <td className="border border-gray-300 px-3 py-1 text-left">
                  {persiapanItem.note_qc_pemakaian}
                </td>
              </tr>
            )}

            {/* User info trail */}
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-blue-50 font-semibold">
                Diminta Oleh
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.user_request?.nama || '-'}
                <div className="text-gray-500 text-[10px]">
                  {formatDateTime(item.tgl_request || item.createdAt)}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-blue-50 font-semibold">
                QC Oleh
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.user_qc?.nama || '-'}
                <div className="text-gray-500 text-[10px]">
                  {formatDateTime(item.tgl_qc)}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1 text-left bg-blue-50 font-semibold">
                Gudang Oleh
              </td>
              <td className="border border-gray-300 px-3 py-1 text-left">
                {item.user_gudang?.nama || '-'}
                <div className="text-gray-500 text-[10px]">
                  {formatDateTime(item.tgl_gudang)}
                </div>
              </td>
            </tr>
            {isPersiapan && (
              <>
                <tr>
                  <td className="border border-gray-300 px-3 py-1 text-left bg-blue-50 font-semibold">
                    Tanggal Pakai
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-left">
                    {formatDateTime(persiapanItem.tgl_pakai)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-1 text-left bg-blue-50 font-semibold">
                    QC Pemakaian Oleh
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-left">
                    {persiapanItem.user_qc_pemakaian?.nama || '-'}
                    <div className="text-gray-500 text-[10px]">
                      {formatDateTime(persiapanItem.tgl_qc_pemakaian)}
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {defects.length > 0 && (
          <table className="border-collapse border border-gray-300 text-xs mt-2 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Kode
                </th>
                <th className="border border-gray-300 px-2 py-1 text-left">
                  Deskripsi
                </th>
                <th className="border border-gray-300 px-2 py-1 text-right">
                  Qty LP
                </th>
                <th className="border border-gray-300 px-2 py-1 text-right">
                  Qty Druk
                </th>
              </tr>
            </thead>
            <tbody>
              {defects.map((d) => (
                <tr key={d.id}>
                  <td className="border border-gray-300 px-2 py-1">{d.kode}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {d.deskripsi}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(
                      d.qty_tambah_bahan_lp ?? d.qty_tambah_bahan ?? 0,
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(d.qty_tambah_bahan_druk ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview{' '}
            {lkhData.produk
              ? `Nama Produk: ${lkhData.produk}`
              : 'null Nama Produk: null'}
          </h2>
          <button
            onClick={onClose}
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

        {/* Content */}
        <div className="p-6">
          {/* Summary Section - Compact Design with Header on Top */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded border-l-4 border-blue-600 mb-3">
              Ringkasan Produksi per Tahapan
            </h3>
            <div className="overflow-x-auto">
              {tahapanChunks.map((chunk, index) =>
                renderSummaryTable(chunk, index),
              )}
            </div>
          </div>

          {/* Detail Process Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded border-l-4 border-green-600 mb-3">
              Detail Proses Produksi
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-xs">
                <thead className="bg-gradient-to-r from-green-700 to-green-600 text-white">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Tanggal
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Nama OPT
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Mesin
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      History
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
                      Keterangan
                    </th>
                    <th
                      className="border border-gray-300 px-3 py-2 text-center font-bold"
                      colSpan={2}
                    >
                      Waktu
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Durasi
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Baik
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Rusak Sebagian
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Rusak Total
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Pallet
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-bold">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lkhData.produksi_lkh_proses
                    .sort(
                      (a, b) =>
                        new Date(b.waktu_mulai).getTime() -
                        new Date(a.waktu_mulai).getTime(),
                    )
                    .map((proses) => (
                      <tr key={proses.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-1.5">
                          {formatDateTime(proses.waktu_mulai).split(' ')[0]}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.operator?.nama || '-'}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.tahapan?.nama_tahapan || '-'}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.kode} {proses.proses}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.deskripsi || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-500 text-[10px] bg-gray-50">
                          <div className="font-semibold">start</div>
                          <div className="font-semibold">stop</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          <div>{formatTime(proses.waktu_mulai)}</div>
                          <div>{formatTime(proses.waktu_selesai)}</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center font-medium">
                          {formatDuration(proses.total_waktu)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.baik || 0)}{' '}
                          {proses.is_final_result && (
                            <span
                              className="ml-1 text-blue-600"
                              title="Final Result"
                            >
                              ★
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.rusak_sebagian || 0)}
                          {proses.is_final_result &&
                            proses.rusak_sebagian !== 0 && (
                              <span
                                className="ml-1 text-blue-600"
                                title="Final Result"
                              >
                                ★
                              </span>
                            )}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.rusak_total || 0)}
                          {proses.is_final_result &&
                            proses.rusak_total !== 0 && (
                              <span
                                className="ml-1 text-blue-600"
                                title="Final Result"
                              >
                                ★
                              </span>
                            )}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">
                          {formatNumber(proses.pallet || 0)}
                          {proses.is_final_result && proses.pallet !== 0 && (
                            <span
                              className="ml-1 text-blue-600"
                              title="Final Result"
                            >
                              ★
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5">
                          {proses.note || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Tambah Bahan Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-cyan-50 to-cyan-100 px-4 py-2 rounded border-l-4 border-cyan-600 mb-3">
              Detail Tambah Bahan
            </h3>

            {loadingTambahBahan ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
              </div>
            ) : tambahBahanPemakaian.length === 0 &&
              tambahBahanPersiapan.length === 0 ? (
              <p className="text-xs text-gray-400">
                Tidak ada data tambah bahan untuk JO ini
              </p>
            ) : (
              <div className="overflow-x-auto">
                {tambahBahanPemakaian.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Pemakaian
                    </div>
                    <div className="flex flex-wrap">
                      {tambahBahanPemakaian.map((item) =>
                        renderTambahBahanCard(item, 'pemakaian'),
                      )}
                    </div>
                  </div>
                )}

                {tambahBahanPersiapan.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Persiapan
                    </div>
                    <div className="flex flex-wrap">
                      {tambahBahanPersiapan.map((item) =>
                        renderTambahBahanCard(item, 'persiapan'),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Waste Section */}
          <div className="mb-6">
            <WasteTable wasteData={lkhData.produksi_lkh_waste || []} />
          </div>
          {/* Approval Log Section */}
          {approvalLogs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 rounded border-l-4 border-purple-600 mb-3 flex items-center gap-2">
                <span>📋</span>
                <span>Approval Log</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-xs">
                  <thead className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold w-16">
                        No
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                        Tahapan
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                        Approved By
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-bold">
                        Approval Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-purple-50">
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {log.tahapanName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {log.userName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {log.approvalDate === null ||
                          log.approvalDate === undefined
                            ? '-'
                            : formatDateTime(log.approvalDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LKHDetailPopup;
