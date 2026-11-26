import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import calculateTime from '../../../../utils/calculateTime';
import { getErrorMessage } from '../../../../utils/qcHelpers';
import ModalVerifikasi from '../../../Modals/Qc/ModalVerifikasi';
import QcActionForm from '../../../Qc/QcActionForm';
import type { QcAction } from '../../../Qc/QcActionForm';
import QcTicketList from '../../../Qc/QcTicketList';
import type { TicketColumn } from '../../../Qc/QcTicketList';
import type { InfoItem } from '../../../Qc/TicketInfo';

const API = import.meta.env.VITE_API_LINK;
const PAGE_SIZE = 10;

const getProcessInfo = (ticket: any) => {
  const processes: any[] = ticket?.proses_mtcs ?? [];
  const last = processes[processes.length - 1] ?? null;
  const previous =
    processes.length > 1 ? processes[processes.length - 2] : null;
  return {
    last,
    scoreBefore: previous?.skor_mtc ?? 0,
    scoreAfter: last?.skor_mtc ?? 0,
  };
};

const getKendala = (t: any) => `${t.kode_lkh} - ${t.nama_kendala}`;

const ScoreFlow = ({ ticket }: { ticket: any }) => {
  const { scoreBefore, scoreAfter } = getProcessInfo(ticket);
  return (
    <div className="flex items-center gap-1">
      <span className="rounded-full bg-orange-200 px-2 text-[11px] font-medium text-orange-600">
        {scoreBefore}%
      </span>
      <svg width="14" height="8" viewBox="0 0 23 8" fill="none">
        <path
          d="M0 3.82353H22M22 3.82353L19.25 1M22 3.82353L19.25 7"
          stroke="#0065DE"
        />
      </svg>
      <span className="rounded-full bg-[#FFF2B1] px-2 text-[11px] font-medium text-[#FCBF11]">
        {scoreAfter}%
      </span>
    </div>
  );
};

const columns: TicketColumn<any>[] = [
  { header: 'Kode Tiket', render: (t) => t.kode_ticket },
  {
    header: 'Selesai MTC',
    render: (t) => convertTimeStampToDate(t.waktu_selesai_mtc),
  },
  { header: 'Mesin', render: (t) => t.mesin },
  { header: 'No JO', render: (t) => t.no_jo },
  { header: 'Nama Item', render: (t) => t.nama_produk },
  { header: 'Kendala', render: getKendala },
  { header: 'Persentase', render: (t) => <ScoreFlow ticket={t} /> },
  {
    header: 'Eksekutor',
    render: (t) => getProcessInfo(t).last?.user_eksekutor?.nama,
  },
];

const buildInfoItems = (t: any): InfoItem[] => {
  const { last, scoreBefore, scoreAfter } = getProcessInfo(t);
  return [
    { label: 'Kode Tiket', value: t.kode_ticket },
    { label: 'Waktu Masuk', value: convertTimeStampToDate(t.createdAt) },
    { label: 'Nama Mesin', value: t.mesin },
    { label: 'No JO', value: t.no_jo },
    { label: 'Nama Item', value: t.nama_produk },
    { label: 'Customer', value: t.nama_customer },
    { label: 'Persentase Awal', value: `${scoreBefore}%` },
    {
      label: 'Persentase Belum Terverifikasi',
      value: `${scoreAfter}%`,
      tone: 'warning',
    },
    { label: 'Operator', value: t.operator },
    { label: 'Eksekutor', value: last?.user_eksekutor?.nama },
    { label: 'Unit', value: last?.unit },
    { label: 'Bagian', value: last?.bagian_mesin },
    {
      label: 'Durasi Perbaikan',
      value: last
        ? calculateTime(last.waktu_mulai_mtc, last.waktu_selesai_mtc)
        : '-',
    },
    { label: 'Cara Perbaikan', value: last?.cara_perbaikan },
    {
      label: 'Kode Analisis',
      value: last
        ? [last.kode_analisis_mtc, last.nama_analisis_mtc]
            .filter(Boolean)
            .join(' - ')
        : '-',
      fullWidth: true,
    },
    { label: 'Kendala', value: getKendala(t), fullWidth: true },
    { label: 'Catatan MTC', value: last?.note_mtc, fullWidth: true },
  ];
};

const TableVerifikasi = () => {
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/ticket`, {
        params: { status_tiket: 'request to qc', page, limit: PAGE_SIZE },
        withCredentials: true,
      });
      const list = res.data?.data ?? [];
      setTotalPage(res.data?.total_page ?? 1);

      // Halaman terakhir kosong setelah aksi → mundur satu halaman
      if (!list.length && page > 1) {
        setPage((p) => p - 1);
        return;
      }
      setTickets(list);
      setLoadError('');
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Gagal memuat data tiket.'));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    axios
      .get(`${API}/me`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((error) => console.log(getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openModal = (ticket: any) => {
    setSubmitError('');
    setSelected(ticket);
  };

  const closeModal = () => {
    if (!isSubmitting) setSelected(null);
  };

  const handleSubmit = async (action: QcAction, note: string) => {
    if (!selected || isSubmitting) return;

    const { last } = getProcessInfo(selected);
    if (!last || !user?.id) {
      setSubmitError('Data proses atau user belum siap. Muat ulang halaman.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await axios.put(
        `${API}/ticket/${action === 'approve' ? 'verifikasiQc' : 'rejectQc'}/${
          selected.id
        }`,
        { id_proses: last.id, id_qc: user.id, note_qc: note },
        { withCredentials: true },
      );
      setSelected(null);
      setSuccessMessage(
        action === 'approve'
          ? 'Tiket berhasil diverifikasi.'
          : 'Tiket berhasil ditolak.',
      );
      await fetchTickets();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {successMessage && (
        <div
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}
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
        onAction={openModal}
        actionLabel="Aksi"
        startNumber={(page - 1) * PAGE_SIZE + 1}
        isLoading={isLoading}
        emptyText="Tidak ada tiket yang menunggu verifikasi."
      />

      <div className="mt-5 flex w-full justify-center md:justify-end">
        <Pagination
          count={totalPage}
          page={page}
          color="primary"
          onChange={(_, value) => setPage(value)}
        />
      </div>

      {selected && (
        <ModalVerifikasi
          key={selected.id}
          isOpen
          onClose={closeModal}
          title="Verifikasi Maintenance"
          items={buildInfoItems(selected)}
        >
          <QcActionForm
            approveLabel="Verifikasi"
            rejectLabel="Tolak"
            isSubmitting={isSubmitting}
            errorMessage={submitError}
            onSubmit={handleSubmit}
          />
        </ModalVerifikasi>
      )}
    </div>
  );
};

export default TableVerifikasi;
