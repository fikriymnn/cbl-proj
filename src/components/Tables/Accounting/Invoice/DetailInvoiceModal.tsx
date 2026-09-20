import axios from 'axios';
import React, { useEffect, useState } from 'react';

type Num = number | string | null | undefined;

export interface InvoiceProduk {
  id: number;
  id_invoice: number;
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  qty: Num;
  unit: string;
  harga: Num;
  diskon_produk?: Num;
  dpp: Num;
  pajak: Num;
  total: Num;
  is_active?: boolean;
}

interface ReturProduk {
  id: number;
  kode_produk: string;
  nama_produk: string;
  qty: Num;
  unit: string;
  total: Num;
}

interface Retur {
  id: number;
  no_retur: string;
  tgl_faktur: string;
  total: Num;
  note?: string;
  status: string;
  status_proses: string;
  retur_produk?: ReturProduk[];
}

interface User {
  nama: string;
  role: string;
  email: string;
}

/** Row as returned by GET /invoice (list) — numbers can arrive as strings */
export interface InvoiceDetail {
  id: number;
  no_invoice: string;
  no_do: string;
  no_po: string;
  nama_customer: string;
  alamat: string;
  tgl_faktur: string;
  tgl_po: string;
  tgl_kirim: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo: string;
  sub_total: Num;
  diskon: Num;
  dpp: Num;
  ppn: Num;
  total: Num;
  dp: Num;
  balance_due: Num;
  is_show_dpp: boolean;
  note: string;
  status: string;
  status_payment: string;
  status_proses: string;
  id_customer: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  // list-only helper fields
  days_until_due?: number;
  due_description?: string;
  waktu?: string;
  // optional (only present if the API sends them)
  invoice_produk?: InvoiceProduk[];
  retur?: Retur[];
  user_create?: User | null;
  user_approve?: User | null;
  user_reject?: User | null;
}

interface DetailInvoiceModalProps {
  invoiceData: InvoiceDetail;
  isOpen: boolean;
  onClose: () => void;
  /** called after a successful PUT so the parent can refresh its list */
  onUpdated?: () => void;
}

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const toInputDate = (v: string | null | undefined): string =>
  v ? v.slice(0, 10) : '';

const fromInputDate = (v: string): string => (v ? `${v}T00:00:00.000Z` : '');

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const formatCurrency = (amount: Num): string =>
  `Rp ${toNum(amount).toLocaleString('id-ID')}`;

const statusColors: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  requested: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  done: 'bg-blue-100 text-blue-800',
};

const paymentColors: { [key: string]: string } = {
  'belum lunas': 'bg-red-100 text-red-800',
  lunas: 'bg-green-100 text-green-800',
  'sebagian lunas': 'bg-yellow-100 text-yellow-800',
};

const Badge = ({ text, colors }: { text: string; colors: any }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      colors[(text || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
    }`}
  >
    {(text || '-').toUpperCase()}
  </span>
);

const inputCls =
  'w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const DetailInvoiceModal: React.FC<DetailInvoiceModalProps> = ({
  invoiceData,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InvoiceDetail>(invoiceData);
  const [products, setProducts] = useState<InvoiceProduk[]>(
    invoiceData.invoice_produk ?? [],
  );

  // Reset whenever a different invoice is opened
  useEffect(() => {
    setForm(invoiceData);
    setProducts(invoiceData.invoice_produk ?? []);
    setIsEditing(false);
  }, [invoiceData]);

  // Editing is only allowed for draft invoices
  const canEdit =
    invoiceData.status?.toLowerCase() === 'draft' &&
    invoiceData.status_proses?.toLowerCase() === 'draft';

  const data = isEditing ? form : invoiceData;
  const shownProducts = isEditing ? products : invoiceData.invoice_produk ?? [];

  const setField = <K extends keyof InvoiceDetail>(
    key: K,
    value: InvoiceDetail[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const setProductField = (id: number, key: keyof InvoiceProduk, v: string) =>
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: v } : x)));

  const handleCancelEdit = () => {
    setForm(invoiceData);
    setProducts(invoiceData.invoice_produk ?? []);
    setIsEditing(false);
  };

  const handleSave = async (): Promise<void> => {
    const total = toNum(form.total);
    const dp = toNum(form.dp);

    const payload: Record<string, unknown> = {
      id_customer: form.id_customer,
      id_create: form.id_create,
      id_approve: form.id_approve,
      id_reject: form.id_reject,
      nama_customer: form.nama_customer,
      no_po: form.no_po,
      no_invoice: form.no_invoice,
      tgl_po: form.tgl_po,
      no_do: form.no_do,
      tgl_kirim: form.tgl_kirim,
      alamat: form.alamat,
      tgl_faktur: form.tgl_faktur,
      tgl_jatuh_tempo: form.tgl_jatuh_tempo,
      waktu_jatuh_tempo: form.waktu_jatuh_tempo,
      sub_total: toNum(form.sub_total),
      dpp: toNum(form.dpp),
      diskon: toNum(form.diskon),
      ppn: toNum(form.ppn),
      total,
      dp,
      balance_due: total - dp,
      note: form.note,
      is_show_dpp: form.is_show_dpp,
      status: form.status,
      status_proses: form.status_proses,
      status_payment: form.status_payment,
      is_active: form.is_active,
    };

    if (products.length > 0) {
      payload.invoice_produk = products.map((p) => ({
        ...p,
        qty: toNum(p.qty),
        harga: toNum(p.harga),
        diskon_produk: toNum(p.diskon_produk),
        dpp: toNum(p.dpp),
        pajak: toNum(p.pajak),
        total: toNum(p.total),
      }));
    }

    try {
      setSaving(true);
      const res = await axios.put(
        `${import.meta.env.VITE_API_LINK}/invoice/${invoiceData.id}`,
        payload,
        { withCredentials: true },
      );
      if (res.data?.success === false) {
        alert('Failed to update invoice. Please try again.');
        return;
      }
      alert('Invoice updated successfully!');
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error updating invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Small helpers to render a view/edit field
  const TextField = ({
    label,
    k,
    className = '',
  }: {
    label: string;
    k:
      | 'no_invoice'
      | 'no_do'
      | 'no_po'
      | 'nama_customer'
      | 'alamat'
      | 'waktu_jatuh_tempo';
    className?: string;
  }) => (
    <div className={className}>
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      {isEditing ? (
        <input
          className={inputCls}
          value={(form[k] as string) ?? ''}
          onChange={(e) => setField(k, e.target.value)}
        />
      ) : (
        <div className="text-sm text-gray-900">{data[k] || '-'}</div>
      )}
    </div>
  );

  const DateField = ({
    label,
    k,
  }: {
    label: string;
    k: 'tgl_faktur' | 'tgl_po' | 'tgl_kirim' | 'tgl_jatuh_tempo';
  }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      {isEditing ? (
        <input
          type="date"
          className={inputCls}
          value={toInputDate(form[k])}
          onChange={(e) => setField(k, fromInputDate(e.target.value))}
        />
      ) : (
        <div className="text-sm text-gray-900">{formatDate(data[k])}</div>
      )}
    </div>
  );

  const MoneyRow = ({
    label,
    k,
    valueClass = 'text-gray-900',
    prefix = '',
  }: {
    label: string;
    k: 'sub_total' | 'diskon' | 'dpp' | 'ppn' | 'dp' | 'total';
    valueClass?: string;
    prefix?: string;
  }) => (
    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      {isEditing ? (
        <input
          type="number"
          className={`${inputCls} !w-44 text-right`}
          value={String(form[k] ?? '')}
          onChange={(e) => setField(k, e.target.value)}
        />
      ) : (
        <span className={`text-sm font-semibold ${valueClass}`}>
          {prefix}
          {formatCurrency(data[k])}
        </span>
      )}
    </div>
  );

  const balanceDue = isEditing
    ? toNum(form.total) - toNum(form.dp)
    : data.balance_due;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={saving ? undefined : onClose}
        ></div>

        <div className="relative inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice Detail
              {isEditing && (
                <span className="ml-2 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  Editing
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Invoice Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Invoice Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="No Invoice:" k="no_invoice" />
                  <TextField label="No DO:" k="no_do" />
                  <TextField label="No PO:" k="no_po" />
                  <div>
                    <span className="text-xs text-gray-600 font-medium">
                      Status:
                    </span>
                    <div className="mt-1">
                      <Badge text={data.status} colors={statusColors} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 gap-3 bg-gray-50 rounded-lg p-4">
                  <TextField label="Customer Name:" k="nama_customer" />
                  <TextField label="Address:" k="alamat" />
                </div>
              </div>

              {/* Date Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Date Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateField label="Tanggal Faktur:" k="tgl_faktur" />
                  <DateField label="Tanggal PO:" k="tgl_po" />
                  <DateField label="Tanggal Kirim:" k="tgl_kirim" />
                  <DateField label="Tanggal Jatuh Tempo:" k="tgl_jatuh_tempo" />
                  <div className="bg-gray-50 rounded-lg p-3">
                    <TextField
                      label="Waktu Jatuh Tempo:"
                      k="waktu_jatuh_tempo"
                    />
                  </div>
                  {invoiceData.due_description && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 font-medium">
                        Sisa Waktu:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceData.due_description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Products (only if the API sends them) */}
              {shownProducts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Invoice Products
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              ['Kode', 'left'],
                              ['Nama Produk', 'left'],
                              ['Qty', 'right'],
                              ['Unit', 'left'],
                              ['Harga', 'right'],
                              ['Diskon', 'right'],
                              ['DPP', 'right'],
                              ['Pajak', 'right'],
                              ['Total', 'right'],
                            ].map(([h, align]) => (
                              <th
                                key={h}
                                className={`px-4 py-3 text-${align} text-xs font-medium text-gray-500 uppercase`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {shownProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-xs text-gray-900">
                                {p.kode_produk}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-900">
                                {p.nama_produk}
                              </td>
                              {(
                                [
                                  'qty',
                                  null,
                                  'harga',
                                  'diskon_produk',
                                  'dpp',
                                  'pajak',
                                  'total',
                                ] as (keyof InvoiceProduk | null)[]
                              ).map((k, i) =>
                                k === null ? (
                                  <td
                                    key={i}
                                    className="px-4 py-3 text-xs text-gray-900"
                                  >
                                    {p.unit}
                                  </td>
                                ) : isEditing ? (
                                  <td key={i} className="px-2 py-2">
                                    <input
                                      type="number"
                                      className={`${inputCls} !text-xs text-right !w-28`}
                                      value={String(p[k] ?? '')}
                                      onChange={(e) =>
                                        setProductField(p.id, k, e.target.value)
                                      }
                                    />
                                  </td>
                                ) : (
                                  <td
                                    key={i}
                                    className={`px-4 py-3 text-xs text-right ${
                                      k === 'diskon_produk'
                                        ? 'text-red-600'
                                        : 'text-gray-900'
                                    } ${k === 'total' ? 'font-semibold' : ''}`}
                                  >
                                    {k === 'qty'
                                      ? toNum(p.qty).toLocaleString('id-ID')
                                      : formatCurrency(p[k] as Num)}
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Financial Information
                </h4>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3">
                  <MoneyRow label="Sub Total:" k="sub_total" />
                  <MoneyRow
                    label="Diskon:"
                    k="diskon"
                    valueClass="text-red-600"
                    prefix="- "
                  />
                  {(data.is_show_dpp || isEditing) && (
                    <MoneyRow label="DPP:" k="dpp" />
                  )}
                  <MoneyRow label="PPN:" k="ppn" />
                  <MoneyRow
                    label="DP:"
                    k="dp"
                    valueClass="text-green-600"
                    prefix="- "
                  />
                  {isEditing && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!form.is_show_dpp}
                        onChange={(e) =>
                          setField('is_show_dpp', e.target.checked)
                        }
                      />
                      Tampilkan DPP di invoice
                    </label>
                  )}
                  <div className="flex justify-between items-center pt-2 bg-white rounded-lg p-3">
                    <span className="text-base text-gray-900 font-bold">
                      Total:
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        className={`${inputCls} !w-48 text-right font-bold`}
                        value={String(form.total ?? '')}
                        onChange={(e) => setField('total', e.target.value)}
                      />
                    ) : (
                      <span className="text-lg text-blue-600 font-bold">
                        {formatCurrency(data.total)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <span className="text-sm text-gray-900 font-semibold">
                      Balance Due:
                    </span>
                    <span className="text-base text-yellow-700 font-bold">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Returns (only if present) */}
              {invoiceData.retur && invoiceData.retur.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Returns (Retur)
                  </h4>
                  <div className="space-y-4">
                    {invoiceData.retur.map((r) => (
                      <div
                        key={r.id}
                        className="bg-red-50 rounded-lg border border-red-200 p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {r.no_retur}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDate(r.tgl_faktur)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge text={r.status} colors={statusColors} />
                            <Badge
                              text={r.status_proses}
                              colors={statusColors}
                            />
                          </div>
                        </div>
                        {r.retur_produk?.map((rp) => (
                          <div
                            key={rp.id}
                            className="flex justify-between text-xs text-gray-800 py-1"
                          >
                            <span>
                              {rp.kode_produk} — {rp.nama_produk} (
                              {toNum(rp.qty).toLocaleString('id-ID')} {rp.unit})
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(rp.total)}
                            </span>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-red-200 flex justify-between items-center">
                          <span className="text-xs text-gray-700 font-medium">
                            Total Retur:
                          </span>
                          <span className="text-sm text-red-700 font-bold">
                            {formatCurrency(r.total)}
                          </span>
                        </div>
                        {r.note && (
                          <div className="mt-2 text-xs text-gray-600 italic">
                            Note: {r.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Status
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">
                      Status Pembayaran:
                    </span>
                    <Badge text={data.status_payment} colors={paymentColors} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-700 font-medium">
                      Status Proses:
                    </span>
                    <Badge text={data.status_proses} colors={statusColors} />
                  </div>
                </div>
              </div>

              {/* User Information (only if present) */}
              {(invoiceData.user_create ||
                invoiceData.user_approve ||
                invoiceData.user_reject) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    User Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(
                      [
                        ['Created By:', invoiceData.user_create, 'blue'],
                        ['Approved By:', invoiceData.user_approve, 'green'],
                        ['Rejected By:', invoiceData.user_reject, 'red'],
                      ] as [string, User | null | undefined, string][]
                    ).map(
                      ([label, u, color]) =>
                        u && (
                          <div
                            key={label}
                            className={`bg-${color}-50 rounded-lg p-3 border border-${color}-200`}
                          >
                            <div className="text-xs text-gray-600 font-medium mb-2">
                              {label}
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              {u.nama}
                            </div>
                            <div className="text-xs text-gray-600">
                              {u.role}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(isEditing || invoiceData.note) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Notes
                  </h4>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.note ?? ''}
                      onChange={(e) => setField('note', e.target.value)}
                    />
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm text-gray-900">
                        {invoiceData.note}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Created At:</span>{' '}
                    {formatDate(invoiceData.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Updated At:</span>{' '}
                    {formatDate(invoiceData.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailInvoiceModal;
