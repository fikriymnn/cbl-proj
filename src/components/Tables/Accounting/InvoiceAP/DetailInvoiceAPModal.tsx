import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { InvoiceAP, InvoiceAPItem } from './types';
import NumberInput from './NumberInput';
import { FieldLabel, PaymentBadge, Spinner, StatusBadge, TaxBadge } from './ui';
import {
  API,
  addDaysToInputDate,
  computeAmounts,
  diffDays,
  errorMessage,
  formatDate,
  formatDateForInput,
  formatQty,
  formatRupiahInt,
  resolveInvoiceTax,
  round2,
  toNum,
} from './utils';

interface DetailInvoiceAPModalProps {
  invoice: InvoiceAP;
  onClose: () => void;
  onUpdated: () => void;
}

interface EditItem {
  id?: number;
  id_good_receipt: number;
  nama: string;
  noGR: string;
  qty: number;
  unit: string;
  harga: number;
  diskon: number;
}

const inputBase =
  'w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
const inputReadOnly = `${inputBase} bg-gray-50`;

const normalizeItem = (it: InvoiceAPItem): EditItem => ({
  id: it.id,
  id_good_receipt: it.id_good_receipt,
  nama:
    it.nama_item ?? it.good_receipt?.nama_item ?? `GR #${it.id_good_receipt}`,
  noGR: it.no_good_receipt ?? it.good_receipt?.no_good_receipt ?? '',
  qty: toNum(it.qty),
  unit: it.unit || '',
  harga: toNum(it.harga),
  diskon: toNum(it.diskon_item),
});

const DetailInvoiceAPModal: React.FC<DetailInvoiceAPModalProps> = ({
  invoice,
  onClose,
  onUpdated,
}) => {
  const editable = invoice.status === 'draft';
  const isTax = resolveInvoiceTax(invoice);

  // Items are not part of the list row, so they are loaded by id
  const [items, setItems] = useState<EditItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState<boolean>(true);
  const [itemsError, setItemsError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Editable header fields
  const [noInvoiceVendor, setNoInvoiceVendor] = useState<string>(
    invoice.no_invoice_vendor || '',
  );
  const [alamat, setAlamat] = useState<string>(invoice.alamat || '');
  const [catatan, setCatatan] = useState<string>(invoice.note || '');
  const [tglFaktur, setTglFaktur] = useState<string>(
    formatDateForInput(invoice.tgl_faktur),
  );
  const [topDays, setTopDays] = useState<number>(() => {
    const parsed = parseInt(invoice.waktu_jatuh_tempo, 10);
    if (!Number.isNaN(parsed)) return parsed;
    return diffDays(invoice.tgl_faktur, invoice.tgl_jatuh_tempo) ?? 30;
  });
  const [isShowDPP, setIsShowDPP] = useState<boolean>(!!invoice.is_show_dpp);

  const dp = toNum(invoice.dp);

  const tglJatuhTempo = editable
    ? addDaysToInputDate(tglFaktur, topDays)
    : formatDateForInput(invoice.tgl_jatuh_tempo);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setItemsLoading(true);
      setItemsError('');
      let list: InvoiceAPItem[] = invoice.invoice_ap_item ?? [];
      try {
        const res = await axios.get(`${API}/invoiceAp/${invoice.id}`, {
          withCredentials: true,
        });
        const d = res.data?.data ?? res.data;
        if (Array.isArray(d?.invoice_ap_item) && d.invoice_ap_item.length > 0) {
          list = d.invoice_ap_item;
        }
      } catch (error) {
        console.error('Error fetching invoice AP detail:', error);
      }
      if (cancelled) return;
      if (list.length === 0) {
        setItemsError(
          'Item invoice tidak dapat dimuat (GET /invoiceAp/:id tidak mengembalikan invoice_ap_item).',
        );
      }
      setItems(list.map(normalizeItem));
      setItemsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [invoice.id, invoice.invoice_ap_item]);

  const computed = useMemo(
    () =>
      items.map((it) => {
        const { total, dpp, pajak } = computeAmounts(
          it.qty,
          it.harga,
          it.diskon,
          isTax,
        );
        return { ...it, total, dpp, pajak };
      }),
    [items, isTax],
  );

  const totals = useMemo(() => {
    const subTotal = computed.reduce((s, i) => s + i.total, 0);
    const totalDPP = computed.reduce((s, i) => s + i.dpp, 0);
    const totalPajak = computed.reduce((s, i) => s + i.pajak, 0);
    const diskon = computed.reduce((s, i) => s + i.diskon, 0);
    const grossTotal = subTotal + totalPajak;
    const balanceDue = grossTotal - dp;
    return { subTotal, totalDPP, totalPajak, diskon, grossTotal, balanceDue };
  }, [computed, dp]);

  const updateItem = (index: number, patch: Partial<EditItem>): void =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );

  const dpTooHigh = editable && dp > Math.round(totals.grossTotal);

  const canSave =
    editable &&
    !saving &&
    !itemsLoading &&
    items.length > 0 &&
    !!tglFaktur &&
    !dpTooHigh;

  const handleSave = async (): Promise<void> => {
    if (!canSave) return;

    const payload = {
      nama_vendor: invoice.nama_vendor,
      no_invoice: invoice.no_invoice,
      no_invoice_vendor: noInvoiceVendor.trim(),
      no_po: invoice.no_po,
      no_surat_jalan: invoice.no_surat_jalan,
      alamat,
      tgl_faktur: tglFaktur,
      tgl_jatuh_tempo: tglJatuhTempo,
      waktu_jatuh_tempo: String(topDays),
      sub_total: round2(totals.subTotal),
      dpp: round2(totals.totalDPP),
      diskon: round2(totals.diskon),
      ppn: round2(totals.totalPajak),
      total: round2(totals.balanceDue),
      dp,
      balance_due: round2(totals.balanceDue),
      note: catatan,
      is_show_dpp: isTax ? isShowDPP : false,
      is_tax: isTax,
      invoice_ap_item: computed.map((i) => ({
        id: i.id,
        id_good_receipt: i.id_good_receipt,
        qty: i.qty,
        unit: i.unit,
        harga: i.harga,
        dpp: round2(i.dpp),
        total: round2(i.total),
        pajak: round2(i.pajak),
        diskon_item: i.diskon,
      })),
    };

    try {
      setSaving(true);
      console.log('Updating invoice AP payload:', payload);
      await axios.put(`${API}/invoiceAp/${invoice.id}`, payload, {
        withCredentials: true,
      });
      alert('Invoice updated successfully!');
      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating invoice AP:', error);
      alert(`Failed to update invoice. ${errorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
              {editable ? 'Edit' : 'Detail'} Purchase Invoice
              <span className="ml-2 text-gray-500 font-normal text-sm">
                {invoice.no_invoice}
              </span>
              <TaxBadge type={isTax ? 'tax' : 'non_tax'} />
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={invoice.status} />
              <PaymentBadge status={invoice.status_payment} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-start"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {itemsError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
              {itemsError}
            </div>
          )}
          {dpTooHigh && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
              DP melebihi total invoice setelah perubahan. Turunkan harga/diskon
              tidak diperbolehkan melewati DP.
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left column */}
            <div className="lg:w-[30%] lg:shrink-0 space-y-3">
              <div>
                <FieldLabel>Nomor Purchase Invoice</FieldLabel>
                <input
                  type="text"
                  value={invoice.no_invoice}
                  readOnly
                  className={inputReadOnly}
                />
              </div>

              <div>
                <FieldLabel>Nomor Invoice Vendor</FieldLabel>
                <input
                  type="text"
                  value={noInvoiceVendor}
                  onChange={(e) => setNoInvoiceVendor(e.target.value)}
                  readOnly={!editable}
                  className={editable ? inputBase : inputReadOnly}
                />
              </div>

              <div>
                <FieldLabel>Vendor</FieldLabel>
                <input
                  type="text"
                  value={invoice.nama_vendor}
                  readOnly
                  className={inputReadOnly}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Nomor PO</FieldLabel>
                  <input
                    type="text"
                    value={invoice.no_po || ''}
                    readOnly
                    className={inputReadOnly}
                  />
                </div>
                <div>
                  <FieldLabel>Nomor Surat Jalan</FieldLabel>
                  <input
                    type="text"
                    value={invoice.no_surat_jalan || ''}
                    readOnly
                    className={inputReadOnly}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Alamat</FieldLabel>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  readOnly={!editable}
                  rows={2}
                  className={editable ? inputBase : inputReadOnly}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Tanggal Faktur</FieldLabel>
                  <input
                    type="date"
                    value={tglFaktur}
                    onChange={(e) => setTglFaktur(e.target.value)}
                    readOnly={!editable}
                    className={editable ? inputBase : inputReadOnly}
                  />
                </div>
                <div>
                  <FieldLabel>Waktu Jatuh Tempo (Hari)</FieldLabel>
                  {editable ? (
                    <NumberInput
                      value={topDays}
                      onChange={setTopDays}
                      decimals={0}
                      placeholder="30"
                      className={inputBase}
                    />
                  ) : (
                    <input
                      type="text"
                      value={`${topDays} hari`}
                      readOnly
                      className={inputReadOnly}
                    />
                  )}
                </div>
              </div>

              <div>
                <FieldLabel>
                  Tanggal Jatuh Tempo{editable ? ' (otomatis)' : ''}
                </FieldLabel>
                <input
                  type="date"
                  value={tglJatuhTempo}
                  readOnly
                  tabIndex={-1}
                  className={`${inputReadOnly} cursor-not-allowed`}
                />
              </div>

              <div>
                <FieldLabel>Catatan</FieldLabel>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  readOnly={!editable}
                  rows={2}
                  className={editable ? inputBase : inputReadOnly}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="flex-1 min-w-0 space-y-3">
              {itemsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Desktop / tablet table */}
                  <div className="hidden md:block bg-white border border-gray-200 rounded overflow-hidden">
                    <div className="overflow-auto max-h-[calc(95vh-340px)]">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {[
                              'No',
                              'Nama Barang',
                              'No GR',
                              'QTY',
                              'Harga',
                              ...(isTax ? ['DPP'] : []),
                              'Diskon',
                              'Total',
                              ...(isTax ? ['Pajak'] : []),
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {computed.length === 0 ? (
                            <tr>
                              <td
                                colSpan={isTax ? 9 : 7}
                                className="px-3 py-4 text-center text-gray-500 text-xs"
                              >
                                No items available
                              </td>
                            </tr>
                          ) : (
                            computed.map((it, index) => (
                              <tr
                                key={it.id ?? `${it.id_good_receipt}-${index}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-2 py-1.5 text-gray-900">
                                  {index + 1}
                                </td>
                                <td
                                  className="px-2 py-1.5 text-gray-900 max-w-[200px]"
                                  title={it.nama}
                                >
                                  {it.nama}
                                </td>
                                <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                  {it.noGR || '-'}
                                </td>
                                <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                  {formatQty(it.qty)} {it.unit}
                                </td>
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  {editable ? (
                                    <NumberInput
                                      value={it.harga}
                                      onChange={(v) =>
                                        updateItem(index, { harga: v })
                                      }
                                      className="w-28 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                                    />
                                  ) : (
                                    <span className="text-gray-900">
                                      {formatRupiahInt(it.harga)}
                                    </span>
                                  )}
                                </td>
                                {isTax && (
                                  <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                    {formatRupiahInt(it.dpp)}
                                  </td>
                                )}
                                <td className="px-2 py-1.5 whitespace-nowrap">
                                  {editable ? (
                                    <NumberInput
                                      value={it.diskon}
                                      max={Math.max(0, it.qty * it.harga)}
                                      onChange={(v) =>
                                        updateItem(index, { diskon: v })
                                      }
                                      className="w-24 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                                    />
                                  ) : (
                                    <span className="text-gray-900">
                                      {formatRupiahInt(it.diskon)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                  {formatRupiahInt(it.total)}
                                </td>
                                {isTax && (
                                  <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                    {formatRupiahInt(it.pajak)}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2">
                    {computed.map((it, index) => (
                      <div
                        key={it.id ?? `${it.id_good_receipt}-${index}`}
                        className="border border-gray-200 rounded-lg p-3 space-y-2"
                      >
                        <div>
                          <div className="text-xs text-gray-500">
                            #{index + 1}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 break-words">
                            {it.nama}
                          </div>
                          {it.noGR && (
                            <div className="text-xs text-gray-500 break-words">
                              {it.noGR}
                            </div>
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">QTY</span>
                          <div className="text-gray-900">
                            {formatQty(it.qty)} {it.unit}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-gray-500">Harga</span>
                            {editable ? (
                              <NumberInput
                                value={it.harga}
                                onChange={(v) =>
                                  updateItem(index, { harga: v })
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-right"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {formatRupiahInt(it.harga)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Diskon
                            </span>
                            {editable ? (
                              <NumberInput
                                value={it.diskon}
                                max={Math.max(0, it.qty * it.harga)}
                                onChange={(v) =>
                                  updateItem(index, { diskon: v })
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-right"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {formatRupiahInt(it.diskon)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {isTax && (
                            <div>
                              <span className="text-gray-500">DPP</span>
                              <div className="text-gray-900">
                                {formatRupiahInt(it.dpp)}
                              </div>
                            </div>
                          )}
                          {isTax && (
                            <div>
                              <span className="text-gray-500">Pajak</span>
                              <div className="text-gray-900">
                                {formatRupiahInt(it.pajak)}
                              </div>
                            </div>
                          )}
                          <div className="text-right col-start-3">
                            <span className="text-gray-500">Total</span>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatRupiahInt(it.total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded p-3 space-y-1.5">
                    {isTax && (
                      <label
                        className={`flex items-center gap-2 ${
                          editable ? 'cursor-pointer' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isShowDPP}
                          disabled={!editable}
                          onChange={(e) => setIsShowDPP(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          Tampilkan DPP (for display only)
                        </span>
                      </label>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        SubTotal
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatRupiahInt(totals.subTotal)}
                      </span>
                    </div>
                    {isTax && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">
                          DPP (Data)
                        </span>
                        <span className="text-xs text-gray-900">
                          {formatRupiahInt(totals.totalDPP)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Diskon
                      </span>
                      <span className="text-xs text-gray-900">
                        {formatRupiahInt(totals.diskon)}
                      </span>
                    </div>
                    {isTax && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">
                          PPn
                        </span>
                        <span className="text-xs text-gray-900">
                          {formatRupiahInt(totals.totalPajak)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        DP
                      </span>
                      <span className="text-xs text-gray-900">
                        {formatRupiahInt(dp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-1.5">
                      <span className="text-sm font-semibold text-gray-900">
                        Total (Balance Due)
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatRupiahInt(totals.balanceDue)}
                      </span>
                    </div>

                    {!editable && (
                      <div className="border-t pt-1.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            Dibayar
                          </span>
                          <span className="text-xs text-green-700">
                            {formatRupiahInt(toNum(invoice.paid_amount))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            Outstanding
                          </span>
                          <span className="text-xs font-bold text-red-600">
                            {formatRupiahInt(toNum(invoice.outstanding_amount))}
                          </span>
                        </div>
                        {invoice.tgl_pelunasan && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">
                              Tgl Pelunasan
                            </span>
                            <span className="text-xs text-gray-900">
                              {formatDate(invoice.tgl_pelunasan)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {editable ? 'Cancel' : 'Close'}
          </button>
          {editable && (
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailInvoiceAPModal;
