import { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import ModalStockCheck1 from '../../Modals/ModalStockCheck1';
import ModalDetail from '../../Modals/ModalDetail';
import ModalMtcLightHeavy from '../../Modals/ModalMtcLightHeavy';
import ModalSPBService from '../../Modals/ModalNewSPBService';
import ModalFull from '../PPIC/JadwalProduksi/ModalFull';
import Loading from '../../Loading';

import convertTimeStampToDate from '../../../utils/convertDate';
import convertDateToTime from '../../../utils/converDateToTime';
import convertTimeStampToDateOnly from '../../../utils/convertDateOnly';
import convertTimeStampToAllSecond from '../../../utils/ConverttimestametoAllSecond';
import { usePermissions } from '../../../constant/usePermissions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: number;
  nama: string;
  role: string;
  bagian: string;
  email: string;
}

interface MasalahSparepart {
  nama_sparepart_sebelumnya: string | null;
  nama_sparepart_baru: string | null;
  lokasi_sparepart_baru: string | null;
  lokasi_sparepart_sebelumnya: string | null;
  grade_sparepart_sebelumnya: string | null;
  grade_sparepart_baru: string | null;
  tgl_ganti: string | null;
  use_qty: number | null;
  status: string | null;
}

interface ProsesMtc {
  id: number;
  id_tiket: number;
  id_eksekutor: number;
  id_qc: number;
  bagian_mesin: string | null;
  cara_perbaikan: string | null;
  kode_analisis_mtc: string | null;
  nama_analisis_mtc: string | null;
  note_analisis: string | null;
  note_mtc: string | null;
  note_qc: string | null;
  skor_mtc: number;
  status_proses: string;
  status_qc: string;
  unit: string | null;
  alasan_pending: string | null;
  estimasi_pengerjaan: string | null;
  tgl_mtc: string | null;
  note_request_jadwal: string | null;
  file: string | null;
  is_rework: boolean;
  waktu_mulai_mtc: string | null;
  waktu_selesai_mtc: string | null;
  waktu_selesai: string | null;
  createdAt: string;
  updatedAt: string;
  user_eksekutor: UserInfo;
  user_qc: UserInfo;
  masalah_spareparts: MasalahSparepart[];
}

interface Ticket {
  id: number;
  id_jo: number;
  id_kendala: number;
  bagian: string;
  bagian_tiket: string;
  cara_perbaikan: string | null;
  createdAt: string;
  updatedAt: string;
  jenis_analisis_mtc: string | null;
  jenis_kendala: string;
  kode_analisis_mtc: string | null;
  kode_lkh: string;
  kode_ticket: string;
  maksimal_kedatangan_tiket: number;
  maksimal_periode_kedatangan_tiket: string;
  maksimal_waktu_pengerjaan: number;
  mesin: string;
  nama_analisis_mtc: string | null;
  nama_customer: string;
  nama_kendala: string;
  nama_produk: string;
  no_io: string;
  no_jo: string;
  no_so: string;
  note_qc: string | null;
  operator: string;
  proses: string;
  qty: number;
  qty_druk: number | null;
  skor_mtc: number;
  spek: string;
  status_qc: string;
  status_tiket: string;
  unit: string | null;
  waktu_mulai_istirahat: string | null;
  waktu_mulai_mtc: string | null;
  waktu_respon: string | null;
  waktu_respon_qc: string | null;
  waktu_selesai: string | null;
  waktu_selesai_istirahat: string | null;
  waktu_selesai_mtc: string | null;
  proses_mtcs: ProsesMtc[];
  user_respon_qc: UserInfo | null;
}

interface TicketResponse {
  data: Ticket[];
  total_page: number;
  limit: string;
  offset: string;
}

interface MasterMesin {
  id: number;
  nama_mesin: string;
}

interface UserOption {
  value: number;
  label: string;
}

interface MasterUser {
  id: number;
  nama: string;
  role: string;
  bagian: string;
  email: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateSecondsDiff(
  start: string | null,
  end: string | null,
): number {
  if (!start || !end) return 0;
  return Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  );
}

function formatSeconds(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '-';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return (
    [
      hours ? `${hours}h ` : '',
      minutes ? `${minutes}m ` : '',
      seconds ? `${seconds}s` : '',
    ]
      .join('')
      .trim() || '-'
  );
}

function formatDateTimeLocal(datetime: string | null): string {
  if (!datetime) return '-';
  const d = new Date(datetime);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

type StatusTiket =
  | 'pending'
  | 'open'
  | 'monitoring'
  | 'temporary'
  | 'request to qc'
  | 'qc rejected';

function getStatusClasses(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-red-600 bg-red-100',
    open: 'text-red-600 bg-red-100',
    monitoring: 'text-blue-600 bg-blue-100',
    temporary: 'text-yellow-600 bg-yellow-100',
    'request to qc': 'text-yellow-600 bg-yellow-100',
    'qc rejected': 'text-red-600 bg-red-100',
  };
  return map[status] ?? '';
}

function getSkorClasses(skor: number): string {
  if (skor >= 60) return 'text-blue-600 bg-blue-100';
  if (skor >= 21) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

// ─── Component ────────────────────────────────────────────────────────────────

function TableOS() {
  const role = localStorage.getItem('userRole') ?? '';
  const bagian = localStorage.getItem('userBagian') ?? '';
  const { checkEdit } = usePermissions(role, bagian);
  const canEdit = checkEdit('/maintenance/corrective');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter state
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [mesinNama, setMesinNama] = useState<string | undefined>();
  const [statusTiket, setStatusTiket] = useState<string | undefined>();
  const [noJo, setNoJo] = useState<string | undefined>();
  const [unit, setUnit] = useState<string | undefined>();
  const [idKaryawan, setIdKaryawan] = useState<number | undefined>();

  // Data
  const [tiket, setTiket] = useState<TicketResponse | null>(null);
  const [masterMesin, setMasterMesin] = useState<MasterMesin[]>([]);
  const [userList, setUserList] = useState<MasterUser[]>([]);
  const [options, setOptions] = useState<UserOption[]>([]);

  // Modal visibility arrays (indexed by row)
  const [showModal1, setShowModal1] = useState<boolean[]>([]);
  const [showModalDetail, setShowModalDetail] = useState<boolean[]>([]);
  const [showDetail, setShowDetail] = useState<boolean[]>([]);
  const [openButton, setOpenButton] = useState<number | null>(null);

  // Edit modal
  const [editingProses, setEditingProses] = useState<{
    ticket: Ticket;
    proses: ProsesMtc;
    prosesIndex: number;
  } | null>(null);

  // Modal state (non-indexed)
  const [showModal2, setShowModal2] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);

  // Export
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [visibleRows, setVisibleRows] = useState(20);

  // ─── Resize ───
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Init fetches ───
  useEffect(() => {
    getMasterMesin();
    getMasterUser();
  }, []);

  useEffect(() => {
    getTiket();
  }, [page, limit]);

  // ─── API Calls ───
  async function getMasterMesin() {
    try {
      const res = await axios.get<MasterMesin[]>(
        `${import.meta.env.VITE_API_LINK}/master/mesin`,
        { withCredentials: true },
      );
      setMasterMesin(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function getMasterUser() {
    try {
      const res = await axios.get<MasterUser[]>(
        `${import.meta.env.VITE_API_LINK}/users`,
        {
          params: { status: 'aktif', bagian: 'maintenance' },
          withCredentials: true,
        },
      );
      setUserList(res.data);
      setOptions(res.data.map((u) => ({ value: u.id, label: u.nama })));
    } catch (err) {
      console.error(err);
    }
  }

  async function getTiket(isRework?: boolean, idModal?: number) {
    try {
      setIsLoading(true);
      const res = await axios.get<TicketResponse>(
        `${import.meta.env.VITE_API_LINK}/ticket`,
        {
          params: {
            search: noJo,
            bagian_tiket: 'os2',
            page,
            unit,
            limit,
            start_date: startDate,
            end_date: endDate,
            mesin: mesinNama,
            status_tiket: statusTiket,
            id_eksekutor: idKaryawan,
          },
          withCredentials: true,
        },
      );
      setTiket(res.data);

      const falseArr = new Array(res.data.data.length).fill(false);
      setShowModal1([...falseArr]);
      setShowModalDetail([...falseArr]);
      setShowDetail([...falseArr]);

      if (isRework && idModal !== undefined) openModal1(idModal);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function reworkTiket(idTiket: number, iModal: number) {
    try {
      setIsLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_API_LINK}/ticket/rework/${idTiket}`,
        {},
        { withCredentials: true },
      );
      alert(res.data.msg);
      getTiket(true, iModal);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Rework failed');
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Modal helpers ───
  const openModal1 = (i: number) =>
    setShowModal1((prev) => {
      const a = [...prev];
      a[i] = true;
      return a;
    });
  const closeModal1 = (i: number) =>
    setShowModal1((prev) => {
      const a = [...prev];
      a[i] = false;
      return a;
    });
  const openModalDetail = (i: number) =>
    setShowModalDetail((prev) => {
      const a = [...prev];
      a[i] = true;
      return a;
    });
  const closeModalDetail = (i: number) =>
    setShowModalDetail((prev) => {
      const a = [...prev];
      a[i] = false;
      return a;
    });
  const toggleDetail = (i: number) =>
    setShowDetail((prev) => {
      const a = [...prev];
      a[i] = !a[i];
      return a;
    });

  // ─── Dropdown handler ───
  const handleChangeUser = (selected: UserOption | null) => {
    if (!selected) return;
    const user = userList.find((u) => u.id === selected.value);
    setIdKaryawan(user?.id);
  };

  // ─── Export ───
  async function prepareExportData() {
    try {
      setIsLoadingPreview(true);
      setVisibleRows(20);

      const res = await axios.get<TicketResponse>(
        `${import.meta.env.VITE_API_LINK}/ticket`,
        {
          params: {
            search: noJo,
            unit,
            bagian_tiket: 'os2',
            page,
            start_date: startDate,
            end_date: endDate,
            mesin: mesinNama,
            status_tiket: statusTiket,
          },
          withCredentials: true,
        },
      );

      const allData = res.data.data;
      if (!allData?.length) {
        alert('No data to export');
        return;
      }

      let rows: Record<string, unknown>[] = [];

      allData.forEach((ticket) => {
        if (ticket.proses_mtcs?.length) {
          ticket.proses_mtcs.forEach((process) => {
            const waktuRespon = calculateSecondsDiff(
              process.waktu_selesai_mtc,
              process.waktu_selesai,
            );
            const waktuBreakdown = calculateSecondsDiff(
              ticket.createdAt,
              process.waktu_selesai,
            );
            const waktuBreakdownMTC = calculateSecondsDiff(
              ticket.waktu_respon_qc,
              process.waktu_selesai_mtc,
            );

            let sparepartInfo = '';
            let sparepartSebelumnya = '-',
              sparepartBaru = '-';
            let lokasiBaru = '-',
              lokasiSebelumnya = '-',
              grade = '-';

            process.masalah_spareparts?.forEach((part, idx) => {
              if (idx === 0) {
                sparepartSebelumnya = part.nama_sparepart_sebelumnya ?? '-';
                sparepartBaru = part.nama_sparepart_baru ?? '-';
                lokasiBaru = part.lokasi_sparepart_baru ?? '-';
                lokasiSebelumnya = part.lokasi_sparepart_sebelumnya ?? '-';
                grade = `${part.grade_sparepart_sebelumnya ?? '-'} -> ${
                  part.grade_sparepart_baru ?? '-'
                }`;
                sparepartInfo = `${sparepartSebelumnya} -> ${sparepartBaru}`;
              } else {
                sparepartInfo += `, ${
                  part.nama_sparepart_sebelumnya ?? '-'
                } -> ${part.nama_sparepart_baru ?? '-'}`;
              }
            });

            rows.push({
              No: rows.length + 1,
              'Kode Tiket': ticket.kode_ticket,
              'Tanggal Tiket': convertTimeStampToDateOnly(ticket.createdAt),
              'Jam Tiket': convertDateToTime(ticket.createdAt),
              'No Jo': ticket.no_jo,
              'No SO': ticket.no_so,
              'No IO': ticket.no_io,
              Item: ticket.nama_produk,
              Mesin: ticket.mesin,
              Proses: ticket.proses,
              Kendala: `${ticket.kode_lkh} - ${ticket.nama_kendala}`,
              'Jenis Kendala': ticket.jenis_kendala,
              'Bagian Tiket': ticket.bagian_tiket,
              Bagian: ticket.bagian,
              Spek: ticket.spek,
              Customer: ticket.nama_customer,
              Operator: ticket.operator,
              QTY: ticket.qty,
              'QTY Druk': ticket.qty_druk ?? '-',
              'Status Tiket': ticket.status_tiket,
              'Kode Analisis (Tiket)': ticket.kode_analisis_mtc ?? '-',
              'Nama Analisis (Tiket)': ticket.nama_analisis_mtc ?? '-',
              'Jenis Analisis MTC': ticket.jenis_analisis_mtc ?? '-',
              'Bagian Mesin': process.bagian_mesin ?? '-',
              Unit: process.unit ?? '-',
              'Cara Perbaikan': process.cara_perbaikan ?? '-',
              'Kode Analisis MTC': process.kode_analisis_mtc ?? '-',
              'Nama Analisis MTC': process.nama_analisis_mtc ?? '-',
              'Note MTC': process.note_mtc ?? '-',
              'Note QC': process.note_qc ?? '-',
              'Skor MTC': process.skor_mtc,
              'Status Proses': process.status_proses,
              'Status QC': process.status_qc,
              'Alasan Pending': process.alasan_pending ?? '-',
              'Detail Sparepart': sparepartInfo || '-',
              'Sparepart Sebelumnya': sparepartSebelumnya,
              'Sparepart Baru': sparepartBaru,
              'Lokasi Sebelumnya': lokasiSebelumnya,
              'Lokasi Baru': lokasiBaru,
              'Grade Perubahan': grade,
              'Tanggal Ganti': process.masalah_spareparts?.[0]?.tgl_ganti
                ? convertTimeStampToDate(
                    process.masalah_spareparts[0].tgl_ganti,
                  )
                : '-',
              'Eksekutor Nama': process.user_eksekutor?.nama ?? '-',
              'QC Nama': process.user_qc?.nama ?? '-',
              'Waktu Respon QC': ticket.waktu_respon_qc
                ? convertTimeStampToAllSecond(ticket.waktu_respon_qc)
                : '-',
              'Waktu Mulai MTC': process.waktu_mulai_mtc
                ? convertTimeStampToAllSecond(process.waktu_mulai_mtc)
                : '-',
              'Waktu Selesai MTC': process.waktu_selesai_mtc
                ? convertTimeStampToAllSecond(process.waktu_selesai_mtc)
                : '-',
              'Waktu Respon Total': formatSeconds(waktuRespon),
              'Waktu Breakdown MTC': formatSeconds(waktuBreakdownMTC),
              'Waktu Breakdown Total': formatSeconds(waktuBreakdown),
              _ts: ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0,
            });
          });
        } else {
          rows.push({
            No: rows.length + 1,
            'Kode Tiket': ticket.kode_ticket,
            'Tanggal Tiket': convertTimeStampToAllSecond(ticket.createdAt),
            'No Jo': ticket.no_jo,
            Mesin: ticket.mesin,
            Kendala: `${ticket.kode_lkh} - ${ticket.nama_kendala}`,
            'Status Tiket': ticket.status_tiket,
            'QC Nama': ticket.user_respon_qc?.nama ?? '-',
            _ts: ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0,
          });
        }
      });

      rows = rows.sort((a, b) => (b._ts as number) - (a._ts as number));
      rows = rows.map((item, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _ts, ...rest } = item;
        return { No: idx + 1, ...rest };
      });

      setPreviewData(rows);
      setVisibleRows(20);
      setShowExportPreview(true);
    } catch (err) {
      console.error(err);
      alert('Preview failed. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  function exportToExcel() {
    try {
      setIsLoadingPreview(true);
      if (!previewData.length) {
        alert('No data to export');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(previewData);
      ws['!cols'] = Object.keys(previewData[0]).map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws, 'Process MTC Details');

      const today = new Date();
      const date = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      let filename = `History_Validasi_${date}`;
      if (startDate && endDate)
        filename += `_${startDate.split('T')[0]}_to_${endDate.split('T')[0]}`;
      if (mesinNama) filename += `_${mesinNama}`;
      if (statusTiket) filename += `_${statusTiket}`;
      if (noJo) filename += `_JO-${noJo}`;
      filename += '.xlsx';

      XLSX.writeFile(wb, filename);
      setShowExportPreview(false);
    } catch (err) {
      console.error(err);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  // ─── Render helpers ───
  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`text-xs px-2 py-0.5 font-medium rounded-full ${getStatusClasses(
        status,
      )}`}
    >
      {status}
    </span>
  );

  const SkorBadge = ({ skor }: { skor: number }) => (
    <span
      className={`text-xs px-2 py-0.5 font-medium rounded-full ${getSkorClasses(
        skor,
      )}`}
    >
      {skor}%
    </span>
  );

  // ─── Render ───
  return (
    <main className="min-h-screen bg-slate-50">
      {isLoading && <Loading />}

      {/* ── Filter Panel ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {/* Date range */}
            <div className="flex gap-2 col-span-1 md:col-span-1 lg:col-span-1">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Dari
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Sampai
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Mesin */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mesin
              </label>
              <select
                onChange={(e) => setMesinNama(e.target.value)}
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
              >
                <option value="">Semua Mesin</option>
                {masterMesin.map((m) => (
                  <option key={m.id} value={m.nama_mesin}>
                    {m.nama_mesin}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Tiket
              </label>
              <select
                onChange={(e) => setStatusTiket(e.target.value)}
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
              >
                <option value="">Semua Status</option>
                <option value="open">Open</option>
                <option value="request to qc">Request to QC</option>
                <option value="temporary">Temporary</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>

            {/* Nama karyawan */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Eksekutor
              </label>
              <Select<UserOption>
                placeholder="Cari nama..."
                options={options}
                onChange={handleChangeUser}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                    minHeight: '36px',
                    height: '36px',
                    fontSize: '14px',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#94a3b8' },
                  }),
                  valueContainer: (base) => ({ ...base, padding: '0 12px' }),
                }}
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cari
              </label>
              <input
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                placeholder="Kendala / No Jo"
                type="text"
                onChange={(e) => setNoJo(e.target.value)}
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Unit
              </label>
              <input
                className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 h-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                placeholder="Cari unit..."
                type="text"
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2 col-span-2 sm:col-span-2 lg:col-span-2">
              <button
                onClick={() => {
                  setPage(1);
                  getTiket();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold h-9 px-4 rounded-lg transition-colors"
              >
                Tampilkan
              </button>
              <button
                onClick={prepareExportData}
                disabled={isLoadingPreview}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold h-9 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingPreview ? 'Loading...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      {!isMobile && (
        <div className="px-4 py-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white rounded-lg shadow-sm border border-slate-100 mb-1">
            <div className="col-span-1">No</div>
            <div className="col-span-2">Waktu Tiket</div>
            <div className="col-span-1">No.Jo</div>
            <div className="col-span-1">Mesin</div>
            <div className="col-span-2">Kendala</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">%</div>
            <div className="col-span-1">Breakdown</div>
            <div className="col-span-1">Aksi</div>
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {tiket?.data.map((data, i) => {
              const lastProses = data.proses_mtcs[data.proses_mtcs.length - 1];
              const waktuBreakdownSeconds = calculateSecondsDiff(
                data.createdAt,
                data.waktu_selesai,
              );
              const waktuValidasiQCSeconds = calculateSecondsDiff(
                data.createdAt,
                data.waktu_respon_qc,
              );
              const waktuBreakdownMTCSeconds = calculateSecondsDiff(
                data.waktu_respon_qc,
                data.waktu_selesai_mtc,
              );
              const waktuVerifikasiQCSeconds = calculateSecondsDiff(
                data.waktu_selesai_mtc,
                data.waktu_selesai,
              );

              return (
                <div
                  key={data.id}
                  className="rounded-xl overflow-hidden shadow-sm border border-slate-100"
                >
                  {/* Main row */}

                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-white items-center hover:bg-slate-50 transition-colors relative">
                    <div className="col-span-1 text-sm text-slate-500 font-medium">
                      {i + 1 + (page - 1) * limit}
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-700">
                        {formatDateTimeLocal(data.createdAt)}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs font-medium text-slate-800">
                        {data.no_jo}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {data.nama_produk}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-slate-700">{data.mesin}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-700">
                        {data.kode_lkh} – {data.nama_kendala}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-slate-700">
                        {data.unit ?? '-'}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <StatusBadge status={data.status_tiket} />
                    </div>
                    <div className="col-span-1">
                      <SkorBadge skor={data.skor_mtc} />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-slate-600">
                        {data.waktu_selesai
                          ? formatSeconds(waktuBreakdownSeconds)
                          : '-'}
                      </p>
                    </div>
                    <div className="col-span-1 flex items-center gap-1.5">
                      {/* Burger menu */}
                      {data.status_tiket !== 'monitoring' &&
                        data.status_tiket !== 'request to qc' && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenButton((prev) => (prev === i ? null : i))
                              }
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <svg
                                width="14"
                                height="14"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <rect y="3" width="20" height="2" rx="1" />
                                <rect y="9" width="20" height="2" rx="1" />
                                <rect y="15" width="20" height="2" rx="1" />
                              </svg>
                            </button>

                            {openButton === i && (
                              <div className="absolute right-5 bottom-4 top-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 min-w-[8rem] flex flex-col gap-1">
                                {data.status_tiket !== 'monitoring' && (
                                  <button
                                    onClick={() => {
                                      setOpenButton(null);
                                      if (data.status_tiket === 'open') {
                                        openModal1(i);
                                      } else if (
                                        data.status_tiket === 'temporary' &&
                                        lastProses?.cara_perbaikan == null
                                      ) {
                                        openModal1(i);
                                      } else {
                                        reworkTiket(data.id, i);
                                      }
                                    }}
                                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    PROSES
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setOpenButton(null);
                                    setShowModal2(true);
                                  }}
                                  className="text-xs font-semibold bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  JADWALKAN
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Expand arrow */}
                      <button
                        onClick={() => toggleDetail(i)}
                        className={`p-1.5 border rounded-lg transition-all ${
                          showDetail[i]
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`transition-transform duration-200 ${
                            showDetail[i] ? 'rotate-180' : ''
                          }`}
                        >
                          <path
                            d="M2 4l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Modals for this row */}
                    {showModal1[i] && (
                      <ModalStockCheck1
                        children={undefined}
                        isOpen={showModal1[i]}
                        onClose={() => closeModal1(i)}
                        onFinish={() => getTiket()}
                        kendala={data.nama_kendala}
                        kodeLkh={data.kode_lkh}
                        machineName={data.mesin}
                        tgl={data.waktu_respon}
                        jam="19.09"
                        namaPemeriksa={lastProses?.user_eksekutor?.nama}
                        no="109299"
                        idTiket={data.id}
                        idProses={lastProses?.id}
                        namaMesin={data.mesin}
                        skor_mtc={lastProses?.skor_mtc}
                        jenis_perbaikan={lastProses?.cara_perbaikan}
                        unit={lastProses?.unit}
                        bagian={lastProses?.bagian_mesin}
                      />
                    )}
                    {showModal2 && (
                      <ModalMtcLightHeavy
                        isOpen={showModal2}
                        onClose={() => setShowModal2(false)}
                        title={undefined}
                      >
                        <div className="pt-5 flex flex-col gap-2">
                          <button
                            onClick={() => setShowModal4(true)}
                            className="w-full h-12 text-white text-xs font-bold bg-blue-700 rounded-md"
                          >
                            PERBAIKAN INTERNAL
                          </button>
                          <button
                            onClick={() => setShowModal5(true)}
                            className="w-full h-12 text-white text-xs font-bold bg-blue-700 rounded-md"
                          >
                            SERVICE
                          </button>
                        </div>
                      </ModalMtcLightHeavy>
                    )}
                    {showModal5 && (
                      <ModalSPBService
                        isOpen={showModal5}
                        onClose={() => setShowModal5(false)}
                        onFinish={getTiket}
                        idProses={lastProses?.id}
                        sumber="Os2"
                        noSPB="MT-0001"
                        tglSpb="20 MEI 2024"
                        data={undefined}
                      >
                        <p />
                      </ModalSPBService>
                    )}
                  </div>

                  {/* Detail expansion */}
                  {showDetail[i] && (
                    <div className="bg-blue-50/70 border-t border-blue-100 px-4 py-4">
                      {/* Summary info row */}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-3 px-2">
                        <div>
                          <span className="font-semibold text-slate-500">
                            Kode Tiket:{' '}
                          </span>
                          <span className="text-slate-700">
                            {data.kode_ticket}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">
                            No. JO:{' '}
                          </span>
                          <span className="text-slate-700">{data.no_jo}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">
                            Pelapor:{' '}
                          </span>
                          <span className="text-slate-700">
                            {data.operator}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">
                            Waktu Respon:{' '}
                          </span>
                          <span className="text-slate-700">
                            {data.waktu_respon_qc
                              ? formatSeconds(
                                  calculateSecondsDiff(
                                    data.createdAt,
                                    data.waktu_respon_qc,
                                  ),
                                )
                              : '0 minutes'}
                          </span>
                        </div>
                      </div>
                      {/* Header labels */}
                      <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-blue-700 mb-2 px-2">
                        <div>#</div>
                        <div className="col-span-2">Waktu Mulai</div>
                        <div>Eksekutor</div>
                        <div>Progress</div>
                        <div>Jenis Perbaikan</div>
                        <div>Unit</div>
                        <div>Aksi</div>
                      </div>

                      {/* Proses rows */}
                      {data.proses_mtcs.map((proses, ii) => (
                        <div
                          key={proses.id}
                          className="grid grid-cols-8 gap-2 text-xs items-center py-2 border-b border-blue-100 last:border-0 px-2"
                        >
                          <div className="font-semibold text-blue-600">
                            {ii + 1}
                          </div>
                          <div className="col-span-2 text-slate-700">
                            {formatDateTimeLocal(proses.waktu_mulai_mtc)}
                          </div>
                          <div className="text-slate-700">
                            {proses.user_eksekutor?.nama ?? '-'}
                          </div>
                          <div>
                            <SkorBadge skor={proses.skor_mtc} />
                          </div>
                          <div className="text-slate-700">
                            {proses.cara_perbaikan ?? '-'}
                          </div>
                          <div className="text-slate-700">
                            {proses.unit ?? '-'}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openModalDetail(ii)}
                              className="text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white px-2 py-1 rounded-lg transition-colors"
                            >
                              Detail
                            </button>
                            {canEdit && (
                              <button
                                onClick={() =>
                                  setEditingProses({
                                    ticket: data,
                                    proses,
                                    prosesIndex: ii,
                                  })
                                }
                                className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                            )}
                          </div>

                          {showModalDetail[ii] && (
                            <ModalDetail
                              children={undefined}
                              isOpen={showModalDetail[ii]}
                              onClose={() => closeModalDetail(ii)}
                              kendala={data.nama_kendala}
                              machineName={data.mesin}
                              tgl={
                                proses.waktu_mulai_mtc
                                  ? formatDateTimeLocal(
                                      proses.waktu_mulai_mtc,
                                    ).split(' ')[0]
                                  : '-'
                              }
                              jam={
                                proses.waktu_mulai_mtc
                                  ? formatDateTimeLocal(
                                      proses.waktu_mulai_mtc,
                                    ).split(' ')[1]
                                  : '-'
                              }
                              namaPemeriksa={proses.user_eksekutor?.nama ?? '-'}
                              no="1"
                              idTiket={data.id}
                              kodeLkh={data.kode_lkh}
                              analisisPenyebab={`${
                                proses.kode_analisis_mtc ?? ''
                              } - ${proses.nama_analisis_mtc ?? ''}`}
                              kebutuhanSparepart={proses.masalah_spareparts}
                              tipeMaintenance={proses.cara_perbaikan}
                              catatan={proses.note_mtc}
                              unit={proses.unit}
                              bagian={proses.bagian_mesin}
                              file={proses.file}
                            />
                          )}
                        </div>
                      ))}

                      {/* QC Rejected notices */}
                      {data.proses_mtcs
                        .filter((p) => p.status_proses === 'qc rejected')
                        .map((p, idx) => (
                          <div
                            key={idx}
                            className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"
                          >
                            <span className="font-bold">QC Rejected</span> —{' '}
                            {p.user_qc?.nama}: {p.note_qc}
                          </div>
                        ))}

                      {/* Timing table */}
                      {data.waktu_selesai && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left px-3 py-2 font-semibold text-slate-600">
                                  Keterangan
                                </th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600">
                                  Detail
                                </th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-600">
                                  Durasi
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              <tr className="bg-white">
                                <td className="px-3 py-2 text-slate-600">
                                  Waktu Tiket Masuk
                                </td>
                                <td className="px-3 py-2">
                                  {formatDateTimeLocal(data.createdAt)}
                                </td>
                                <td className="px-3 py-2">—</td>
                              </tr>
                              <tr
                                className={
                                  waktuValidasiQCSeconds >= 1800
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-white'
                                }
                              >
                                <td className="px-3 py-2">Waktu Validasi QC</td>
                                <td className="px-3 py-2">
                                  {data.user_respon_qc?.nama} ~{' '}
                                  {formatDateTimeLocal(data.waktu_respon_qc)}
                                </td>
                                <td className="px-3 py-2">
                                  {formatSeconds(waktuValidasiQCSeconds)}
                                </td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-3 py-2 text-slate-600">
                                  Waktu Breakdown MTC
                                </td>
                                <td className="px-3 py-2">
                                  {formatDateTimeLocal(data.waktu_mulai_mtc)} –{' '}
                                  {formatDateTimeLocal(data.waktu_selesai_mtc)}
                                </td>
                                <td className="px-3 py-2">
                                  {formatSeconds(waktuBreakdownMTCSeconds)}
                                </td>
                              </tr>
                              <tr
                                className={
                                  waktuVerifikasiQCSeconds >= 3600
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-white'
                                }
                              >
                                <td className="px-3 py-2">
                                  Waktu Verifikasi QC
                                </td>
                                <td className="px-3 py-2">
                                  {data.proses_mtcs.at(-1)?.user_qc?.nama} ~{' '}
                                  {formatDateTimeLocal(
                                    data.proses_mtcs.at(-1)?.waktu_selesai ??
                                      null,
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {formatSeconds(waktuVerifikasiQCSeconds)}
                                </td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-3 py-2 text-slate-600">
                                  Waktu Breakdown Total
                                </td>
                                <td className="px-3 py-2">—</td>
                                <td className="px-3 py-2">
                                  {formatSeconds(waktuBreakdownSeconds)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {tiket?.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 48 48"
                  className="mb-3 opacity-40"
                >
                  <rect
                    x="8"
                    y="8"
                    width="32"
                    height="32"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 24h16M16 18h10M16 30h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm">Tidak ada data</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows:</span>
              <div className="flex gap-1">
                {[10, 25, 50, 100].map((ps) => (
                  <button
                    key={ps}
                    onClick={() => {
                      setLimit(ps);
                      setPage(1);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      limit === ps
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>
            <Stack spacing={2}>
              <Pagination
                count={tiket?.total_page ?? 1}
                color="primary"
                page={page}
                onChange={(_, p) => setPage(p)}
              />
            </Stack>
          </div>
        </div>
      )}

      {/* ── Mobile View ── */}
      {isMobile && (
        <div className="px-3 py-3 space-y-2">
          {tiket?.data.map((data, i) => {
            const lastProses = data.proses_mtcs[data.proses_mtcs.length - 1];
            const waktuBreakdownSeconds = calculateSecondsDiff(
              data.createdAt,
              data.waktu_selesai,
            );

            return (
              <div
                key={data.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 font-medium">
                          #{i + 1 + (page - 1) * limit}
                        </span>
                        <StatusBadge status={data.status_tiket} />
                        <SkorBadge skor={data.skor_mtc} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.mesin}
                      </p>
                      <p className="text-xs text-slate-500">
                        {data.kode_lkh} – {data.nama_kendala}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTimeLocal(data.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {data.status_tiket !== 'monitoring' &&
                        data.status_tiket !== 'request to qc' && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenButton((prev) => (prev === i ? null : i))
                              }
                              className="p-2 bg-blue-600 text-white rounded-lg"
                            >
                              <svg
                                width="14"
                                height="14"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <rect y="3" width="20" height="2" rx="1" />
                                <rect y="9" width="20" height="2" rx="1" />
                                <rect y="15" width="20" height="2" rx="1" />
                              </svg>
                            </button>
                            {openButton === i && (
                              <div className="absolute right-0  bg-white border border-slate-200 rounded-xl shadow-xl  p-2 min-w-32 flex flex-col gap-1">
                                {data.status_tiket !== 'monitoring' && (
                                  <button
                                    onClick={() => {
                                      setOpenButton(null);
                                      if (data.status_tiket === 'open')
                                        openModal1(i);
                                      else if (
                                        data.status_tiket === 'temporary' &&
                                        lastProses?.cara_perbaikan == null
                                      )
                                        openModal1(i);
                                      else reworkTiket(data.id, i);
                                    }}
                                    className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg"
                                  >
                                    PROSES
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setOpenButton(null);
                                    setShowModal2(true);
                                  }}
                                  className="text-xs font-semibold bg-slate-600 text-white px-3 py-1.5 rounded-lg"
                                >
                                  JADWALKAN
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      <button
                        onClick={() => toggleDetail(i)}
                        className={`p-2 border rounded-lg transition-all ${
                          showDetail[i]
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-blue-600 text-blue-600'
                        }`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`transition-transform ${
                            showDetail[i] ? 'rotate-180' : ''
                          }`}
                        >
                          <path
                            d="M2 4l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {showDetail[i] && (
                  <div className="bg-blue-50 border-t border-blue-100 px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-600">
                          Kode Tiket
                        </span>
                        <p>{data.kode_ticket}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">
                          No. JO
                        </span>
                        <p>{data.no_jo}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">
                          Pelapor
                        </span>
                        <p>{data.operator}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">
                          Breakdown
                        </span>
                        <p>{formatSeconds(waktuBreakdownSeconds)}</p>
                      </div>
                    </div>

                    {data.proses_mtcs.map((proses, ii) => (
                      <div
                        key={proses.id}
                        className="bg-white rounded-lg p-3 border border-blue-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-600">
                            Pengerjaan {ii + 1}
                          </span>
                          <SkorBadge skor={proses.skor_mtc} />
                        </div>
                        <p className="text-xs text-slate-600">
                          {proses.user_eksekutor?.nama}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateTimeLocal(proses.waktu_mulai_mtc)}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => openModalDetail(ii)}
                            className="text-xs font-semibold bg-slate-700 text-white px-3 py-1 rounded-lg"
                          >
                            Detail
                          </button>
                          {canEdit && (
                            <button
                              onClick={() =>
                                setEditingProses({
                                  ticket: data,
                                  proses,
                                  prosesIndex: ii,
                                })
                              }
                              className="text-xs font-semibold bg-amber-500 text-white px-3 py-1 rounded-lg"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        {showModalDetail[ii] && (
                          <ModalDetail
                            children={undefined}
                            isOpen={showModalDetail[ii]}
                            onClose={() => closeModalDetail(ii)}
                            kendala={data.nama_kendala}
                            machineName={data.mesin}
                            tgl={
                              proses.waktu_mulai_mtc
                                ? formatDateTimeLocal(
                                    proses.waktu_mulai_mtc,
                                  ).split(' ')[0]
                                : '-'
                            }
                            jam={
                              proses.waktu_mulai_mtc
                                ? formatDateTimeLocal(
                                    proses.waktu_mulai_mtc,
                                  ).split(' ')[1]
                                : '-'
                            }
                            namaPemeriksa={proses.user_eksekutor?.nama ?? '-'}
                            no="1"
                            idTiket={data.id}
                            kodeLkh={data.kode_lkh}
                            analisisPenyebab={`${
                              proses.kode_analisis_mtc ?? ''
                            } - ${proses.nama_analisis_mtc ?? ''}`}
                            kebutuhanSparepart={proses.masalah_spareparts}
                            tipeMaintenance={proses.cara_perbaikan}
                            catatan={proses.note_mtc}
                            unit={proses.unit}
                            bagian={proses.bagian_mesin}
                            file={proses.file}
                          />
                        )}
                      </div>
                    ))}

                    {/* Modal triggers */}
                    {showModal1[i] && (
                      <ModalStockCheck1
                        children={undefined}
                        isOpen={showModal1[i]}
                        onClose={() => closeModal1(i)}
                        onFinish={() => getTiket()}
                        kendala={data.nama_kendala}
                        kodeLkh={data.kode_lkh}
                        machineName={data.mesin}
                        tgl={data.waktu_respon}
                        jam="19.09"
                        namaPemeriksa={lastProses?.user_eksekutor?.nama}
                        no="109299"
                        idTiket={data.id}
                        idProses={lastProses?.id}
                        namaMesin={data.mesin}
                        skor_mtc={lastProses?.skor_mtc}
                        jenis_perbaikan={lastProses?.cara_perbaikan}
                        unit={lastProses?.unit}
                        bagian={lastProses?.bagian_mesin}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-center mt-4 pb-4">
            <Stack spacing={2}>
              <Pagination
                count={tiket?.total_page ?? 1}
                color="primary"
                page={page}
                onChange={(_, p) => setPage(p)}
              />
            </Stack>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingProses && (
        <ModalStockCheck1
          children={undefined}
          isOpen={true}
          onClose={() => setEditingProses(null)}
          onFinish={() => {
            setEditingProses(null);
            getTiket();
          }}
          kendala={editingProses.ticket.nama_kendala}
          kodeLkh={editingProses.ticket.kode_lkh}
          machineName={editingProses.ticket.mesin}
          tgl={editingProses.proses.waktu_mulai_mtc}
          jam=""
          namaPemeriksa={editingProses.proses.user_eksekutor?.nama}
          no=""
          idTiket={editingProses.ticket.id}
          idProses={editingProses.proses.id}
          namaMesin={editingProses.ticket.mesin}
          skor_mtc={editingProses.proses.skor_mtc}
          jenis_perbaikan={editingProses.proses.cara_perbaikan}
          unit={editingProses.proses.unit}
          bagian={editingProses.proses.bagian_mesin}
          isEditMode={true}
          editInitialData={editingProses.proses}
        />
      )}

      {/* ── Export Preview Modal ── */}
      {showExportPreview && (
        <ModalFull
          isOpen={showExportPreview}
          onClose={() => setShowExportPreview(false)}
          judul="Export Preview"
        >
          <div className="flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-4 px-2 pt-5">
              <span className="text-sm text-slate-500">
                Total: {previewData.length} baris
              </span>
              <button
                onClick={exportToExcel}
                disabled={isLoadingPreview}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingPreview ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
            <div className="overflow-auto flex-1">
              <table className="min-w-full bg-white border border-slate-200 rounded-lg text-xs">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  <tr>
                    {previewData.length > 0 &&
                      Object.keys(previewData[0]).map((key, idx) => (
                        <th
                          key={idx}
                          className="py-2 px-3 border-b text-left font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, visibleRows).map((row, ri) => (
                    <tr
                      key={ri}
                      className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      {Object.values(row).map((val, ci) => (
                        <td
                          key={ci}
                          className="py-1.5 px-3 border-b whitespace-nowrap"
                        >
                          {String(val ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t bg-slate-50 py-3 px-4">
              <span className="text-sm text-slate-500">
                Showing {Math.min(visibleRows, previewData.length)} /{' '}
                {previewData.length}
              </span>
              {visibleRows < previewData.length && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setVisibleRows((v) =>
                        Math.min(v + 20, previewData.length),
                      )
                    }
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-lg"
                  >
                    +20 Baris
                  </button>
                  <button
                    onClick={() => setVisibleRows(previewData.length)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                  >
                    Semua ({previewData.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </ModalFull>
      )}
    </main>
  );
}

export default TableOS;
