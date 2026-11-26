import type { ReactNode } from 'react';
import convertTimeStampToDateTime from '../../utils/converDateTime';
import { isPositiveStatus } from '../../utils/qcHelpers';
import TicketInfo from '../Qc/TicketInfo';
import type { InfoItem } from '../Qc/TicketInfo';
import { CloseButton, useEscapeKey } from '../Qc/ModalParts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  nama_kendala?: any;
  nama_mesin?: any;
  operator?: any;
  note?: any;
  status?: any;
  unit?: any;
  bagian?: any;
  nojo?: any;
  customer?: any;
  masalah?: any;
  validator?: any;
  waktuMasuk?: any;
  waktuSelesai?: any;
  WaktuBreakdown?: any;
  waktuBreakdownMTC?: any;
  waktuVerifikasiQC?: any;
  data?: any;
}

const ModalDetailValidasi = ({
  isOpen,
  onClose,
  children,
  nama_kendala,
  nama_mesin,
  operator,
  note,
  status,
  unit,
  bagian,
  nojo,
  customer,
  masalah,
  validator,
  waktuMasuk,
  waktuSelesai,
  WaktuBreakdown,
  waktuBreakdownMTC,
  waktuVerifikasiQC,
  data,
}: Props) => {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const items: InfoItem[] = [
    { label: 'Operator', value: operator },
    { label: 'Nama Mesin', value: nama_mesin },
    { label: 'Nama Kendala', value: nama_kendala },
    { label: 'Note QC', value: note },
    { label: 'Waktu Tiket Dibuat', value: waktuMasuk },
    { label: 'Waktu Selesai MTC', value: waktuSelesai },
    {
      label: 'Status QC',
      value: status ? (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
            isPositiveStatus(status)
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </span>
      ) : null,
    },
    { label: 'Unit', value: unit },
    { label: 'Bagian', value: bagian },
    { label: 'Validator/Verifikator', value: validator },
    { label: 'No. JO', value: nojo },
    { label: 'Customer', value: customer },
    { label: 'Masalah Dari Kendala', value: masalah },
    { label: 'Breakdown Time', value: WaktuBreakdown },
    { label: 'Waktu Breakdown MTC', value: waktuBreakdownMTC },
    { label: 'Waktu Verifikasi QC', value: waktuVerifikasiQC },
    {
      label: 'Jam Verifikasi QC',
      value: data?.waktu_selesai
        ? convertTimeStampToDateTime(data.waktu_selesai)
        : null,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-25"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-2xl sm:max-w-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-700 sm:text-xl">
              Detail Validasi
            </h3>
            <CloseButton onClick={onClose} size={20} />
          </div>

          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <TicketInfo items={items} columns={1} />
          </div>

          {children}
        </div>
      </div>
    </>
  );
};

export default ModalDetailValidasi;
