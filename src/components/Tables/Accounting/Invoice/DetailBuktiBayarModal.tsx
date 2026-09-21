// DetailBuktiBayarModal.tsx
import React, { useState } from 'react';

type Num = number | string | null | undefined;

export interface PaymentDetailInvoice {
  id: number;
  no_invoice: string;
  nama_customer: string;
  total: Num;
  balance_due: Num;
  paid_amount: Num;
  status_payment: string;
}

export interface PaymentDetail {
  id: number;
  invoice_payment_id: number;
  invoice_id: number;
  payment_amount: Num;
  invoice?: PaymentDetailInvoice;
}

export interface PaymentLog {
  id: number;
  customer_id: number;
  created_by: number;
  receipt_number: string;
  payment_amount: Num;
  payment_amount_use: Num;
  payment_proof: string | null;
  payment_date: string;
  payment_method: string;
  bank: string | null;
  account_number: string | null;
  note: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  created_user?: { id: number; nama: string } | null;
  payment_details?: PaymentDetail[];
}

interface DetailBuktiBayarModalProps {
  payment: PaymentLog;
  isOpen: boolean;
  onClose: () => void;
}

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (v: Num): string =>
  `Rp ${toNum(v).toLocaleString('id-ID')}`;

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const paymentBadge = (status: string) => {
  const colors: { [key: string]: string } = {
    'belum lunas': 'bg-red-100 text-red-800',
    lunas: 'bg-green-100 text-green-800',
    'sebagian lunas': 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
        colors[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

const DetailBuktiBayarModal: React.FC<DetailBuktiBayarModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  if (!isOpen) return null;

  const details = payment.payment_details ?? [];
  const customerName = details[0]?.invoice?.nama_customer ?? '-';
  const imageUrl = payment.payment_proof
    ? `${import.meta.env.VITE_API_LINK}/images/${payment.payment_proof}`
    : '';
  const unallocated =
    toNum(payment.payment_amount) - toNum(payment.payment_amount_use);

  const InfoItem = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div>
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      <div className="text-sm text-gray-900">{value || '-'}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fullscreen image */}
      {isFullscreen && imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] overflow-auto"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative w-full min-h-screen flex justify-center p-4">
            <img
              src={imageUrl}
              alt="Bukti pembayaran"
              className="max-w-full h-auto block"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
              onClick={() => setIsFullscreen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div>
              <h3 className="text-base font-bold">Detail Bukti Bayar</h3>
              <p className="text-xs text-green-100 mt-0.5">
                {payment.receipt_number}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl leading-none font-bold hover:text-green-200"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
            {/* Payment info */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Informasi Pembayaran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem
                  label="No Bukti Bayar:"
                  value={payment.receipt_number}
                />
                <InfoItem label="Customer:" value={customerName} />
                <InfoItem
                  label="Tanggal Bayar:"
                  value={formatDate(payment.payment_date)}
                />
                <InfoItem
                  label="Metode:"
                  value={
                    <span className="capitalize">{payment.payment_method}</span>
                  }
                />
                <InfoItem label="Bank:" value={payment.bank} />
                <InfoItem
                  label="No. Rekening:"
                  value={payment.account_number}
                />
                <InfoItem
                  label="Dibuat Oleh:"
                  value={payment.created_user?.nama}
                />
                <InfoItem
                  label="Dibuat Pada:"
                  value={formatDate(payment.createdAt)}
                />
                <InfoItem label="Catatan:" value={payment.note} />
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs text-gray-500 font-medium">
                  Total Pembayaran
                </p>
                <p className="text-lg font-bold text-green-700 mt-1">
                  {formatCurrency(payment.payment_amount)}
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs text-gray-500 font-medium">
                  Dialokasikan ke Invoice
                </p>
                <p className="text-lg font-bold text-blue-700 mt-1">
                  {formatCurrency(payment.payment_amount_use)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  unallocated > 0
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-500 font-medium">
                  Belum Dialokasikan
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    unallocated > 0 ? 'text-amber-700' : 'text-gray-600'
                  }`}
                >
                  {formatCurrency(unallocated)}
                </p>
              </div>
            </div>

            {/* Paid invoices */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Invoice Dibayar ({details.length})
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          ['No Invoice', 'left'],
                          ['Total Invoice', 'right'],
                          ['Dibayar (bukti ini)', 'right'],
                          ['Total Terbayar', 'right'],
                          ['Status', 'left'],
                        ].map(([h, align]) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-${align} text-xs font-medium text-gray-500 uppercase whitespace-nowrap`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {details.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-sm text-gray-500"
                          >
                            Tidak ada rincian invoice
                          </td>
                        </tr>
                      ) : (
                        details.map((d) => (
                          <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">
                              {d.invoice?.no_invoice || `#${d.invoice_id}`}
                            </td>
                            <td className="px-4 py-3 text-xs text-right text-gray-700 whitespace-nowrap">
                              {formatCurrency(d.invoice?.total)}
                            </td>
                            <td className="px-4 py-3 text-xs text-right font-semibold text-green-700 whitespace-nowrap">
                              {formatCurrency(d.payment_amount)}
                            </td>
                            <td className="px-4 py-3 text-xs text-right text-gray-700 whitespace-nowrap">
                              {formatCurrency(d.invoice?.paid_amount)}
                            </td>
                            <td className="px-4 py-3">
                              {paymentBadge(d.invoice?.status_payment ?? '')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Proof */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Bukti Pembayaran
              </h4>
              {imageUrl && !imageError ? (
                <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4 text-center space-y-2">
                  <img
                    src={imageUrl}
                    alt="Bukti pembayaran"
                    onError={() => setImageError(true)}
                    onClick={() => setIsFullscreen(true)}
                    className="max-h-64 mx-auto object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <p className="text-xs text-gray-500">
                    Klik gambar untuk memperbesar
                  </p>
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Buka di tab baru
                  </a>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                  {payment.payment_proof
                    ? 'Gambar bukti tidak dapat dimuat'
                    : 'Tidak ada bukti pembayaran'}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBuktiBayarModal;
