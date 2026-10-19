import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import type { GoodReceipt, InvoiceNumberResponse } from './types';
import NumberInput from './NumberInput';
import { useVendorOptions } from './useVendorOptions';
import { FieldLabel, TaxBadge } from './ui';
import {
  API,
  addDaysToInputDate,
  computeAmounts,
  errorMessage,
  formatQty,
  formatRupiahInt,
  round2,
  todayInputDate,
  toNum,
} from './utils';

interface CreateInvoiceAPModalProps {
  receipts: GoodReceipt[];
  onClose: () => void;
  onCreated: () => void;
}

const unique = (values: Array<string | null | undefined>): string =>
  Array.from(new Set(values.map((v) => (v || '').trim()).filter(Boolean))).join(
    ', ',
  );

const inputBase =
  'w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
const inputReadOnly = `${inputBase} bg-gray-50`;

const CreateInvoiceAPModal: React.FC<CreateInvoiceAPModalProps> = ({
  receipts,
  onClose,
  onCreated,
}) => {
  const first = receipts[0];
  const idVendor = first.id_vendor;
  const vendorName = first.nama_vendor;

  // Tax / non tax follows the GR (is_ppn) — mixing is not allowed
  const taxError =
    new Set(receipts.map((r) => !!r.is_ppn)).size > 1
      ? 'GR Tax dan Non Tax tidak boleh digabung dalam satu invoice.'
      : '';
  const isTax = !!first.is_ppn;

  const noPO = unique(receipts.map((r) => r.no_purchase_order));
  const noSuratJalan = unique(receipts.map((r) => r.no_surat_jalan));
  const noGR = unique(receipts.map((r) => r.no_good_receipt));

  const { vendors } = useVendorOptions();

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [numberLoading, setNumberLoading] = useState<boolean>(false);
  const [noInvoiceVendor, setNoInvoiceVendor] = useState<string>('');
  const [tglFaktur, setTglFaktur] = useState<string>(todayInputDate());
  const [topDays, setTopDays] = useState<number>(30);
  const [alamat, setAlamat] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [isShowDPP, setIsShowDPP] = useState<boolean>(false);
  const [dp, setDP] = useState<number>(0);
  const [diskonMap, setDiskonMap] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const tglJatuhTempo = useMemo(
    () => addDaysToInputDate(tglFaktur, topDays),
    [tglFaktur, topDays],
  );

  // Pre-fill vendor address from Master Vendor (once)
  const addressFilled = useRef<boolean>(false);
  useEffect(() => {
    if (addressFilled.current) return;
    const v = vendors.find((x) => x.id === idVendor);
    if (v) {
      addressFilled.current = true;
      if (v.alamat) setAlamat(v.alamat);
    }
  }, [vendors, idVendor]);

  // Invoice number depends on the date + tax type
  useEffect(() => {
    if (!tglFaktur || taxError) {
      setInvoiceNumber('');
      return;
    }
    let cancelled = false;
    setNumberLoading(true);
    axios
      .get<InvoiceNumberResponse>(`${API}/invoiceApNomor`, {
        params: { tgl_kirim: tglFaktur },
        withCredentials: true,
      })
      .then((res) => {
        if (cancelled) return;
        const no = isTax
          ? res.data.no_invoice_tax_new
          : res.data.no_invoice_non_tax_new;
        setInvoiceNumber(no || '');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error fetching invoice number:', error);
        setInvoiceNumber('');
        alert('Gagal mengambil nomor invoice. Silakan coba lagi.');
      })
      .finally(() => {
        if (!cancelled) setNumberLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tglFaktur, isTax, taxError]);

  // Lines — amounts are always derived, never stored
  const items = useMemo(
    () =>
      receipts.map((r) => {
        const qty = toNum(r.qty);
        const harga = toNum(r.harga);
        const diskon = diskonMap[r.id] || 0;
        const { total, dpp, pajak } = computeAmounts(qty, harga, diskon, isTax);
        return { gr: r, qty, harga, diskon, total, dpp, pajak };
      }),
    [receipts, diskonMap, isTax],
  );

  const totals = useMemo(() => {
    const subTotal = items.reduce((s, i) => s + i.total, 0);
    const totalDPP = items.reduce((s, i) => s + i.dpp, 0);
    const totalPajak = items.reduce((s, i) => s + i.pajak, 0);
    const diskon = items.reduce((s, i) => s + i.diskon, 0);
    const grossTotal = subTotal + totalPajak; // before DP
    const balanceDue = grossTotal - dp;
    return { subTotal, totalDPP, totalPajak, diskon, grossTotal, balanceDue };
  }, [items, dp]);

  // If the total drops below the DP (discount increased), clamp DP
  useEffect(() => {
    const maxDP = Math.max(0, Math.round(totals.grossTotal));
    if (dp > maxDP) setDP(maxDP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.grossTotal]);

  const handleDiskonChange = (grId: number, value: number): void =>
    setDiskonMap((prev) => ({ ...prev, [grId]: value }));

  const canSubmit =
    !submitting &&
    !numberLoading &&
    items.length > 0 &&
    !!tglFaktur &&
    !!invoiceNumber &&
    !taxError &&
    totals.balanceDue >= 0;

  const handleSubmit = async (): Promise<void> => {
    if (taxError) {
      alert(taxError);
      return;
    }
    if (!tglFaktur) {
      alert('Tanggal faktur wajib diisi.');
      return;
    }
    if (!invoiceNumber) {
      alert('Nomor invoice belum tersedia. Silakan coba lagi.');
      return;
    }

    const payload = {
      id_vendor: idVendor,
      nama_vendor: vendorName,
      no_invoice: invoiceNumber,
      no_invoice_vendor: noInvoiceVendor.trim(),
      alamat,
      tgl_faktur: tglFaktur,
      tgl_jatuh_tempo: tglJatuhTempo,
      waktu_jatuh_tempo: String(topDays),
      sub_total: round2(totals.subTotal),
      dpp: round2(totals.totalDPP),
      diskon: round2(totals.diskon),
      ppn: round2(totals.totalPajak), // non tax = 0
      total: round2(totals.balanceDue),
      dp,
      balance_due: round2(totals.balanceDue),
      note: catatan,
      is_show_dpp: isTax ? isShowDPP : false,
      is_tax: isTax,
      invoice_ap_item: items.map((i) => ({
        id_good_receipt: i.gr.id,
        qty: i.qty,
        unit: i.gr.satuan,
        harga: i.harga,
        dpp: round2(i.dpp),
        total: round2(i.total),
        pajak: round2(i.pajak),
        diskon_item: i.diskon,
      })),
    };

    try {
      setSubmitting(true);
      console.log('Submitting invoice AP payload:', payload);
      await axios.post(`${API}/invoiceAp`, payload, { withCredentials: true });
      alert('Invoice created successfully!');
      onCreated();
    } catch (error) {
      console.error('Error creating invoice AP:', error);
      alert(`Failed to create invoice. ${errorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Create Purchase Invoice (AP)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
          {taxError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
              {taxError}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left column — form */}
            <div className="lg:w-[30%] lg:shrink-0 space-y-3">
              <div>
                <FieldLabel>
                  Nomor Purchase Invoice
                  <TaxBadge type={isTax ? 'tax' : 'non_tax'} />
                </FieldLabel>
                <div className="relative">
                  <input
                    type="text"
                    value={numberLoading ? 'Memuat...' : invoiceNumber}
                    readOnly
                    className={inputReadOnly}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Nomor Invoice Vendor</FieldLabel>
                <input
                  type="text"
                  value={noInvoiceVendor}
                  onChange={(e) => setNoInvoiceVendor(e.target.value)}
                  placeholder="mis. INV-VENDOR-001"
                  className={inputBase}
                />
              </div>

              <div>
                <FieldLabel>Vendor</FieldLabel>
                <input
                  type="text"
                  value={vendorName}
                  readOnly
                  className={inputReadOnly}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Nomor PO</FieldLabel>
                  <input
                    type="text"
                    value={noPO}
                    readOnly
                    className={inputReadOnly}
                  />
                </div>
                <div>
                  <FieldLabel>Nomor Surat Jalan</FieldLabel>
                  <input
                    type="text"
                    value={noSuratJalan}
                    readOnly
                    className={inputReadOnly}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Nomor Good Receipt</FieldLabel>
                <input
                  type="text"
                  value={noGR}
                  readOnly
                  className={inputReadOnly}
                />
              </div>

              <div>
                <FieldLabel>Alamat</FieldLabel>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2}
                  className={inputBase}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Tanggal Faktur</FieldLabel>
                  <input
                    type="date"
                    value={tglFaktur}
                    onChange={(e) => setTglFaktur(e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <FieldLabel>Waktu Jatuh Tempo (Hari)</FieldLabel>
                  <NumberInput
                    value={topDays}
                    onChange={setTopDays}
                    decimals={0}
                    placeholder="30"
                    className={inputBase}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Tanggal Jatuh Tempo (otomatis)</FieldLabel>
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
                  rows={2}
                  className={inputBase}
                  placeholder="Add notes here..."
                />
              </div>
            </div>

            {/* Right column — items + summary */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Desktop / tablet table */}
              <div className="hidden md:block bg-white border border-gray-200 rounded overflow-hidden">
                <div className="overflow-auto max-h-[calc(95vh-320px)]">
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
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isTax ? 9 : 7}
                            className="px-3 py-4 text-center text-gray-500 text-xs"
                          >
                            No items available
                          </td>
                        </tr>
                      ) : (
                        items.map((it, index) => (
                          <tr key={it.gr.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1.5 text-gray-900">
                              {index + 1}
                            </td>
                            <td
                              className="px-2 py-1.5 text-gray-900 max-w-[200px]"
                              title={it.gr.nama_item}
                            >
                              {it.gr.nama_item}
                            </td>
                            <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                              {it.gr.no_good_receipt}
                            </td>
                            <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                              {formatQty(it.qty)} {it.gr.satuan}
                            </td>
                            <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                              {formatRupiahInt(it.harga)}
                            </td>
                            {isTax && (
                              <td className="px-2 py-1.5 text-gray-900 whitespace-nowrap">
                                {formatRupiahInt(it.dpp)}
                              </td>
                            )}
                            <td className="px-2 py-1.5">
                              <NumberInput
                                value={it.diskon}
                                max={Math.max(0, it.qty * it.harga)}
                                onChange={(v) =>
                                  handleDiskonChange(it.gr.id, v)
                                }
                                className="w-24 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                              />
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
                {items.map((it, index) => (
                  <div
                    key={it.gr.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">
                          #{index + 1}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 break-words">
                          {it.gr.nama_item}
                        </div>
                        <div className="text-xs text-gray-500 break-words">
                          {it.gr.no_good_receipt}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">QTY</span>
                        <div className="text-gray-900">
                          {formatQty(it.qty)} {it.gr.satuan}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Harga</span>
                        <div className="text-gray-900">
                          {formatRupiahInt(it.harga)}
                        </div>
                      </div>
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
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">Diskon</span>
                        <NumberInput
                          value={it.diskon}
                          max={Math.max(0, it.qty * it.harga)}
                          onChange={(v) => handleDiskonChange(it.gr.id, v)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-right"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Total</span>
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isShowDPP}
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

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-700">DP</span>
                  <NumberInput
                    value={dp}
                    decimals={0}
                    max={Math.max(0, Math.round(totals.grossTotal))}
                    onChange={setDP}
                    className="w-36 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-1.5">
                  <span className="text-sm font-semibold text-gray-900">
                    Total (Balance Due)
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatRupiahInt(totals.balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {submitting ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceAPModal;
