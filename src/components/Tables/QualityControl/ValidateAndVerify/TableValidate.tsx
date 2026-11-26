import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import { getErrorMessage } from '../../../../utils/qcHelpers';
import ModalVerifikasi from '../../../Modals/Qc/ModalVerifikasi';
import QcActionForm from '../../../Qc/QcActionForm';
import type { QcAction } from '../../../Qc/QcActionForm';
import QcTicketList from '../../../Qc/QcTicketList';
import type { TicketColumn } from '../../../Qc/QcTicketList';
import type { InfoItem } from '../../../Qc/TicketInfo';

const API = import.meta.env.VITE_API_LINK;

const isMesin = (t: any) =>
  String(t?.jenis_kendala ?? '').toLowerCase() === 'mesin';

const getKendalaLabel = (t: any) =>
  [isMesin(t) ? t.kode_lkh : t.kode_kendala, t.nama_kendala, t.jenis_kendala]
    .filter(Boolean)
    .join(' - ');

const getEndpoint = (t: any, action: QcAction) => {
  const mesin = isMesin(t);
  const path =
    action === 'approve'
      ? mesin
        ? 'ticket/validate'
        : 'kendalaLkh/validate'
      : mesin
      ? 'ticket/tolak'
      : 'kendalaLkh/reject';
  return `${API}/${path}/${t.id}`;
};

const buildInfoItems = (t: any): InfoItem[] => [
  { label: 'Kode Tiket', value: t.kode_ticket },
  { label: 'Waktu Masuk', value: convertTimeStampToDate(t.createdAt) },
  { label: 'Nama Mesin', value: t.mesin },
  { label: 'No JO', value: t.no_jo },
  { label: 'Nama Item', value: t.nama_produk },
  { label: 'Customer', value: t.nama_customer },
  { label: 'Operator', value: t.operator },
  { label: 'Jenis Kendala', value: t.jenis_kendala },
  { label: 'Unit', value: t.unit },
  { label: 'Bagian', value: t.bagian },
  { label: 'Kendala', value: getKendalaLabel(t), fullWidth: true },
  { label: 'Masalah', value: t.nama_analisis_mtc, fullWidth: true },
];

const columns: TicketColumn<any>[] = [
  { header: 'Kode Tiket', render: (t) => t.kode_ticket },
  { header: 'Waktu Masuk', render: (t) => convertTimeStampToDate(t.createdAt) },
  { header: 'Nama Mesin', render: (t) => t.mesin },
  { header: 'No JO', render: (t) => t.no_jo },
  { header: 'Nama Item', render: (t) => t.nama_produk },
  { header: 'Kendala', render: getKendalaLabel },
];

const TableValidasi = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/validasiQc`, {
        withCredentials: true,
      });
      setTickets(res.data?.data ?? []);
      setLoadError('');
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Gagal memuat data tiket.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await axios.put(
        getEndpoint(selected, action),
        { note_qc: note },
        { withCredentials: true },
      );
      setSelected(null);
      setSuccessMessage(
        action === 'approve'
          ? 'Tiket berhasil divalidasi.'
          : 'Tiket berhasil ditolak.',
      );
      await fetchTickets();
    } catch (error) {
      // Error dari backend (mis. pengecekan validasi) ditampilkan di dalam form
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
        getKey={(t) => `${t.jenis_kendala}-${t.id}`}
        onAction={openModal}
        actionLabel="Aksi"
        isLoading={isLoading}
        emptyText="Tidak ada tiket yang menunggu validasi."
      />

      {selected && (
        <ModalVerifikasi
          key={`${selected.jenis_kendala}-${selected.id}`}
          isOpen
          onClose={closeModal}
          title={`Validasi Kendala ${selected.jenis_kendala ?? ''}`}
          items={buildInfoItems(selected)}
        >
          <QcActionForm
            approveLabel="Validasi"
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

export default TableValidasi;
