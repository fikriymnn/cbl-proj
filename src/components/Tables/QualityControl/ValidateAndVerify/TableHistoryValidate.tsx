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
  { value: 'di validasi', label: 'di validasi' },
  { value: 'di tolak', label: 'di tolak' },
];

const columns: TicketColumn<any>[] = [
  { header: 'Kode Tiket', render: (t) => t.kode_ticket },
  {
    header: 'Tanggal Tiket',
    render: (t) => convertTimeStampToDateOnly(t.createdAt),
  },
  { header: 'No JO', render: (t) => t.no_jo },
  { header: 'Item', render: (t) => t.nama_produk },
  { header: 'Jam Tiket', render: (t) => convertDateToTime(t.createdAt) },
  { header: 'Status', render: (t) => <StatusBadge value={t.status_qc} /> },
  { header: 'Nama Mesin', render: (t) => t.mesin },
  { header: 'Kendala', render: (t) => `${t.kode_lkh} - ${t.nama_kendala}` },
  {
    header: 'Waktu Respon',
    render: (t) => durationBetween(t.createdAt, t.waktu_respon_qc),
  },
];

const TableHistoryValidate = () => {
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

  const [tickets, setTickets] = useState<any[]>([]);
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
      const res = await axios.get(`${API}/ticket`, {
        params: {
          page,
          limit: PAGE_SIZE,
          historiQc: true,
          ...toApiParams(applied),
        },
        withCredentials: true,
      });
      setTickets(res.data?.data ?? []);
      setTotalPage(res.data?.total_page ?? 1);
      setLoadError('');
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Gagal memuat history validasi.'));
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
      const res = await axios.get(`${API}/ticket`, {
        params: { historiQc: true, ...toApiParams(applied) },
        withCredentials: true,
      });
      const all = toArray(res.data?.data);
      if (!all.length) {
        alert('Tidak ada data untuk diekspor');
        return;
      }

      const pairs = all.flatMap((ticket: any) =>
        ticket.proses_mtcs?.length
          ? ticket.proses_mtcs.map((process: any) => ({ ticket, process }))
          : [{ ticket, process: null }],
      );
      setExportRows(buildExportRows(pairs));
    } catch (error) {
      alert(getErrorMessage(error, 'Gagal menyiapkan data export.'));
    } finally {
      setIsPreparing(false);
    }
  };

  const timings = selected ? getTicketTimings(selected) : null;

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}

      <QcHistoryFilters
        filters={filters}
        onChange={updateFilters}
        machines={machines}
        statusLabel="Status:"
        statusOptions={STATUS_OPTIONS}
        searchPlaceholder="Jo, Io, Item"
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
        rows={tickets}
        columns={columns}
        getKey={(t) => t.id}
        onAction={setSelected}
        startNumber={(page - 1) * PAGE_SIZE + 1}
        isLoading={isLoading}
        emptyText="Belum ada history validasi."
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
          status={selected.status_qc}
          note={selected.note_qc}
          nama_kendala={selected.nama_kendala}
          nama_mesin={selected.mesin}
          operator={selected.operator}
          unit={selected.unit}
          bagian={selected.bagian}
          validator={selected.user_respon_qc?.nama}
          nojo={selected.no_jo}
          customer={selected.nama_customer}
          masalah={selected.nama_analisis_mtc}
          waktuMasuk={convertTimeStampToDate(selected.createdAt)}
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
          filename={buildExportFilename('History_Validasi', applied)}
          onClose={() => setExportRows(null)}
        />
      )}
    </div>
  );
};

export default TableHistoryValidate;
