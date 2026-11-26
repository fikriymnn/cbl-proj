import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import convertTimeStampToDateOnly from '../../../../utils/convertDate';
import convertDateToTime from '../../../../utils/converDateToTime';
import {
  buildExportFilename,
  buildExportRows,
  durationBetween,
  getErrorMessage,
  getTicketTimings,
  toApiParams,
  toArray,
} from '../../../../utils/qcHelpers';
import ModalDetailValidasi from '../../../Modals/ModalDetailValidasi';
import Loading from '../../../Loading';
import QcHistoryFilters from '../../../Qc/QcHistoryFilters';
import QcTicketList, { StatusBadge } from '../../../Qc/QcTicketList';
import type { TicketColumn } from '../../../Qc/QcTicketList';
import ExportPreviewModal from '../../../Qc/ExportPreviewModal';
import {
  useHistoryFilters,
  useMasterMesin,
} from '../../../Qc/useHistoryFilters';

const API = import.meta.env.VITE_API_LINK;
const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'approved', label: 'approved' },
  { value: 'rejected', label: 'rejected' },
];

// `row` di sini adalah proses MTC, tiketnya ada di `row.tiket`
const columns: TicketColumn<any>[] = [
  { header: 'Kode Tiket', render: (p) => p.tiket?.kode_ticket },
  {
    header: 'Tanggal Tiket',
    render: (p) =>
      convertTimeStampToDateOnly(p.tiket?.createdAt ?? p.createdAt),
  },
  { header: 'No Jo', render: (p) => p.tiket?.no_jo },
  { header: 'Item', render: (p) => p.tiket?.nama_produk },
  { header: 'Mesin', render: (p) => p.tiket?.mesin },
  {
    header: 'Kendala',
    render: (p) => `${p.tiket?.kode_lkh} - ${p.tiket?.nama_kendala}`,
  },
  {
    header: 'Jam Tiket',
    render: (p) => convertDateToTime(p.tiket?.createdAt ?? p.createdAt),
  },
  { header: 'Status', render: (p) => <StatusBadge value={p.status_qc} /> },
  { header: 'Skor', render: (p) => p.skor_mtc },
  {
    header: 'Waktu Respon',
    render: (p) => durationBetween(p.waktu_selesai_mtc, p.waktu_selesai),
  },
];

const TableHistory = () => {
  const {
    page,
    setPage,
    filters,
    updateFilters,
    applied,
    apply,
    reset,
    filterError,
  } = useHistoryFilters();
  const machines = useMasterMesin();

  const [processes, setProcesses] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const [isPreparing, setIsPreparing] = useState(false);
  const [exportRows, setExportRows] = useState<Record<string, any>[] | null>(
    null,
  );

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/prosessMtcHistoryQc`, {
        params: { page, limit: PAGE_SIZE, ...toApiParams(applied) },
        withCredentials: true,
      });
      setProcesses(res.data?.data ?? []);
      setTotalPage(res.data?.total_page ?? 1);
      setLoadError('');
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Gagal memuat history verifikasi.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const prepareExport = async () => {
    setIsPreparing(true);
    try {
      const res = await axios.get(`${API}/prosessMtcHistoryQc`, {
        params: toApiParams(applied),
        withCredentials: true,
      });
      const all = toArray(res.data);
      if (!all.length) {
        alert('Tidak ada data untuk diekspor');
        return;
      }
      setExportRows(
        buildExportRows(
          all.map((process: any) => ({
            ticket: process.tiket ?? {},
            process,
          })),
        ),
      );
    } catch (error) {
      alert(getErrorMessage(error, 'Gagal menyiapkan data export.'));
    } finally {
      setIsPreparing(false);
    }
  };

  const ticket = selected?.tiket ?? {};
  const timings = selected ? getTicketTimings(ticket, selected) : null;

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}

      <QcHistoryFilters
        filters={filters}
        onChange={updateFilters}
        machines={machines}
        statusLabel="Status Tiket:"
        statusOptions={STATUS_OPTIONS}
        searchPlaceholder="Jo, Io, Item, Customer, Kendala"
        error={filterError}
        isExporting={isPreparing}
        onSubmit={apply}
        onReset={reset}
        onExport={prepareExport}
      />

      {loadError && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {loadError}
        </div>
      )}

      <QcTicketList
        rows={processes}
        columns={columns}
        getKey={(p) => p.id}
        onAction={setSelected}
        startNumber={(page - 1) * PAGE_SIZE + 1}
        isLoading={isLoading}
        emptyText="Belum ada history verifikasi."
      />

      <div className="mt-5 flex w-full justify-center">
        <Pagination
          count={totalPage}
          page={page}
          color="primary"
          onChange={(_, value) => setPage(value)}
        />
      </div>

      {selected && timings && (
        <ModalDetailValidasi
          isOpen
          onClose={() => setSelected(null)}
          status={selected.status_qc ?? ticket.status_qc}
          note={selected.note_qc}
          nama_kendala={ticket.nama_kendala}
          nama_mesin={ticket.mesin}
          operator={ticket.operator}
          unit={selected.unit}
          bagian={selected.bagian_mesin}
          validator={selected.user_qc?.nama}
          nojo={ticket.no_jo}
          customer={ticket.nama_customer}
          masalah={ticket.nama_analisis_mtc}
          waktuMasuk={convertTimeStampToDate(ticket.createdAt)}
          waktuSelesai={
            timings.selesaiMtc
              ? convertTimeStampToDate(timings.selesaiMtc)
              : '-'
          }
          WaktuBreakdown={timings.breakdownTotal}
          waktuBreakdownMTC={timings.breakdownMtc}
          waktuVerifikasiQC={timings.verifikasiQc}
          data={selected}
        />
      )}

      {exportRows && (
        <ExportPreviewModal
          rows={exportRows}
          filename={buildExportFilename('History_Verifikasi', applied)}
          onClose={() => setExportRows(null)}
        />
      )}
    </div>
  );
};

export default TableHistory;
