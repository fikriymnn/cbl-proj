// PaymentARModal.tsx
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

/* =============================================================================
 * FLOW
 * -----------------------------------------------------------------------------
 * 1. User enters the TRANSFER amount (as shown on the proof).
 * 2. The transfer is distributed to the selected invoices (auto-distributed in
 *    list order, editable per invoice).
 *      - distribution per invoice  <= outstanding of that invoice (hard rule)
 *      - distribution may be LESS than outstanding (invoice = sebagian lunas)
 *      - total distribution        <= transfer
 *      - transfer may be MORE than total distribution -> the rest is deposit
 *        (handled by BE; frontend only shows a confirm popup)
 * 3. Additional costs (Pajak / Biaya administrasi / Lainnya) are ALWAYS taken
 *    out of the distribution of that invoice — no checkbox needed:
 *        cash into kas   = distribution - costs
 *        invoice settled = distribution  (cash + costs)
 *    Example: invoice 1.000.000, transfer 1.000.000, biaya admin 5.000
 *             -> kas 995.000 + biaya 5.000, invoice lunas.
 *
 * PAYLOAD (unchanged shape)
 *   payment_amount (top)      = transfer - total costs   (money into kas,
 *                               incl. any excess that becomes deposit)
 *   invoices[].payment_amount = distribution - costs      (cash for invoice)
 *   invoices[].additional_costs
 *   => BE: settled = payment_amount + sum(costs) = distribution
 *      deposit = top payment_amount - sum(invoice payment_amount)
 *              = transfer - total distribution
 *   Invoices with 0 distribution are not sent.
 * ========================================================================== */

// Max size for a directly uploaded image (same rule as the karyawan photo: 1MB)
const MAX_FILE_SIZE = 1024 * 1024;
const EPSILON = 1e-9;

type Num = number | string | null | undefined;

export interface PayableInvoice {
  id: number;
  id_customer: number;
  nama_customer: string;
  no_invoice: string;
  no_do: string;
  no_po?: string;
  tgl_faktur?: string;
  tgl_jatuh_tempo: string;
  waktu_jatuh_tempo?: string;
  total: Num;
  paid_amount: Num;
  outstanding_amount: Num;
  due_description: string;
}

interface PaymentARModalProps {
  customerId: number;
  customerName: string;
  invoices: PayableInvoice[];
  onClose: () => void;
  onSuccess: () => void;
}

type CostType = 'Pajak' | 'Biaya administrasi' | 'Lainnya';

interface CostItem {
  id: string;
  type: CostType;
  customName: string; // only used when type === 'Lainnya'
  amount: number;
  note: string;
}

const COST_TYPES: CostType[] = ['Pajak', 'Biaya administrasi', 'Lainnya'];

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

// Avoids float noise (0.1 + 0.2) in sums / comparisons
const r2 = (n: number): number => Math.round(n * 100) / 100;

const formatCurrency = (v: Num): string =>
  `Rp ${toNum(v).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}/${d.getFullYear()}`;
};

const todayLocal = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

// ---------------------------------------------------------------------------
// NumberInput — text input formatted with id-ID thousands separators
// ("1.000") that also accepts a comma as the decimal separator ("0,64").
// Never shows a forced "0" and always reports a plain number to `onChange`.
// Smallest supported unit is 0,01; a positive value below that is rounded UP
// to 0,01 instead of vanishing as 0.
// ---------------------------------------------------------------------------

const formatNumberID = (value: number): string => {
  if (!value) return '';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const sanitizeNumericInput = (raw: string): string => {
  let out = '';
  let commaUsed = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',' && !commaUsed) {
      out += ',';
      commaUsed = true;
    }
  }
  return out;
};

const formatTypingDisplay = (sanitized: string): string => {
  if (!sanitized) return '';
  const hasComma = sanitized.includes(',');
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intDigits = (intPartRaw || '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInt = Number(intDigits).toLocaleString('id-ID');
  const fracPart = hasComma ? (fracPartRaw || '').slice(0, 2) : '';
  return hasComma ? `${groupedInt},${fracPart}` : groupedInt;
};

const parseNumberID = (raw: string): number => {
  const sanitized = sanitizeNumericInput(raw);
  if (!sanitized) return 0;
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intPart = intPartRaw || '0';
  const fracPart = fracPartRaw ? fracPartRaw.slice(0, 2) : '';
  const parsed = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const roundToSupportedPrecision = (value: number): number => {
  if (!value) return 0;
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0 && value > 0) return 0.01;
  if (rounded === 0 && value < 0) return -0.01;
  return rounded;
};

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToSupportedPrecision(value)),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync when the value changes from OUTSIDE (e.g. auto-distribution or the
  // "Lunas" button), never while the user is typing.
  useEffect(() => {
    if (isFocused) return;
    const r = roundToSupportedPrecision(value);
    setDisplay(formatNumberID(r));
    if (Math.abs(r - value) > EPSILON) onChange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      placeholder={placeholder ?? '0'}
      disabled={disabled}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = Math.max(
          roundToSupportedPrecision(parseNumberID(display)),
          min,
        );
        setDisplay(parsed === 0 ? '' : formatNumberID(parsed));
        onChange(parsed);
      }}
      onChange={(e) => {
        const sanitized = sanitizeNumericInput(e.target.value);
        setDisplay(formatTypingDisplay(sanitized));
        onChange(Math.max(parseNumberID(sanitized), min));
      }}
      className={className}
    />
  );
};

// ---------------------------------------------------------------------------

/** Fills invoices in list order with the transfer, capped at each outstanding */
const distribute = (
  transfer: number,
  invoices: PayableInvoice[],
): Record<number, number> => {
  let left = transfer;
  const out: Record<number, number> = {};
  for (const inv of invoices) {
    const alloc = r2(
      Math.min(Math.max(left, 0), toNum(inv.outstanding_amount)),
    );
    out[inv.id] = alloc;
    left = r2(left - alloc);
  }
  return out;
};

const PaymentARModal: React.FC<PaymentARModalProps> = ({
  customerId,
  customerName,
  invoices,
  onClose,
  onSuccess,
}) => {
  const totalOutstanding = r2(
    invoices.reduce((s, i) => s + toNum(i.outstanding_amount), 0),
  );

  // Step 1: transfer amount (as on the proof). Default = pay everything.
  const [transfer, setTransfer] = useState<number>(totalOutstanding);
  // Step 2: distribution per invoice (<= outstanding)
  const [amounts, setAmounts] = useState<Record<number, number>>(() =>
    distribute(totalOutstanding, invoices),
  );
  // Additional costs per invoice id (always deducted from the distribution)
  const [costs, setCosts] = useState<Record<number, CostItem[]>>({});

  const [paymentDate, setPaymentDate] = useState<string>(todayLocal());
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [bank, setBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Proof file (image directly, or PDF → pick a page)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [showPdfPicker, setShowPdfPicker] = useState<boolean>(false);
  const [processingPdf, setProcessingPdf] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ── Calculations ──

  const rows = useMemo(
    () =>
      invoices.map((inv) => {
        const outstanding = toNum(inv.outstanding_amount);
        const entered = amounts[inv.id] ?? 0; // distribution
        const costTotal = r2(
          (costs[inv.id] || []).reduce((s, c) => s + c.amount, 0),
        );
        const cash = r2(entered - costTotal); // into kas
        const remaining = r2(outstanding - entered); // unpaid after this
        return { inv, outstanding, entered, costTotal, cash, remaining };
      }),
    [invoices, amounts, costs],
  );

  const sumOutstanding = totalOutstanding;
  const sumEntered = r2(rows.reduce((s, r) => s + r.entered, 0));
  const sumCosts = r2(rows.reduce((s, r) => s + r.costTotal, 0));
  const sumRemaining = r2(
    rows.reduce((s, r) => s + Math.max(r.remaining, 0), 0),
  );
  // + = transfer not distributed to any invoice (-> deposit by BE)
  const unallocated = r2(transfer - sumEntered);
  // Money that really enters kas (sent as top-level payment_amount)
  const kasMasuk = r2(transfer - sumCosts);

  // ── Handlers ──

  const setAmount = (id: number, v: number): void =>
    setAmounts((p) => ({ ...p, [id]: v }));

  const autoDistribute = (t: number = transfer): void =>
    setAmounts(distribute(t, invoices));

  const handleTransferChange = (v: number): void => {
    if (Math.abs(v - transfer) <= EPSILON) return;
    setTransfer(v);
    setAmounts(distribute(v, invoices));
  };

  const addCost = (invId: number): void =>
    setCosts((p) => ({
      ...p,
      [invId]: [
        ...(p[invId] || []),
        {
          id: uid(),
          type: 'Biaya administrasi',
          customName: '',
          amount: 0,
          note: '',
        },
      ],
    }));

  const updateCost = (
    invId: number,
    costId: string,
    patch: Partial<CostItem>,
  ): void =>
    setCosts((p) => ({
      ...p,
      [invId]: (p[invId] || []).map((c) =>
        c.id === costId ? { ...c, ...patch } : c,
      ),
    }));

  const removeCost = (invId: number, costId: string): void =>
    setCosts((p) => ({
      ...p,
      [invId]: (p[invId] || []).filter((c) => c.id !== costId),
    }));

  // ── File handling ──

  const processPdfFile = async (file: File): Promise<void> => {
    try {
      setProcessingPdf(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pages.push(canvas.toDataURL('image/jpeg', 0.85));
      }

      setPdfPages(pages);
      setShowPdfPicker(true);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setFileError('Error processing PDF file');
    } finally {
      setProcessingPdf(false);
    }
  };

  const handlePdfSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setFileError('Please select a PDF file');
      return;
    }
    setFileError('');
    await processPdfFile(file);
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File): void => {
    if (!file.type.startsWith('image/')) {
      setFileError('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file maksimal 1 MB');
      return;
    }

    setFileError('');
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  /** User picked a page of the PDF → turn it into an image File */
  const handlePickPdfPage = async (dataUrl: string): Promise<void> => {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `payment-proof-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    setSelectedFile(file);
    setFilePreview(dataUrl);
    setShowPdfPicker(false);
    setPdfPages([]);
  };

  const clearFile = (): void => {
    if (filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview('');
    setFileError('');
  };

  /** Uploads the proof to /images and returns the stored filename */
  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return (
        response.data.fileName || response.data.filename || response.data.file
      );
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error('Gagal mengupload file');
    }
  }

  // ── Submit ──

  const validate = (): string => {
    if (!paymentDate) return 'Tanggal pembayaran wajib diisi';
    if (paymentMethod === 'transfer' && !bank.trim())
      return 'Bank wajib diisi untuk transfer';
    if (paymentMethod === 'transfer' && !selectedFile)
      return 'Bukti pembayaran wajib diunggah untuk transfer';
    if (transfer <= 0) return 'Nominal transfer harus lebih dari 0';
    if (sumEntered <= 0) return 'Distribusikan nominal ke minimal 1 invoice';
    if (sumEntered - transfer > EPSILON)
      return `Total distribusi (${formatCurrency(
        sumEntered,
      )}) melebihi nominal transfer (${formatCurrency(transfer)})`;

    for (const r of rows) {
      const label = r.inv.no_invoice;
      if (r.entered - r.outstanding > EPSILON)
        return `Nominal ${label} tidak boleh melebihi outstanding (${formatCurrency(
          r.outstanding,
        )})`;
      if (r.cash < 0)
        return `Biaya tambahan ${label} melebihi nominal yang dialokasikan`;

      for (const c of costs[r.inv.id] || []) {
        if (c.type === 'Lainnya' && !c.customName.trim())
          return `Nama biaya tambahan ${label} wajib diisi`;
        if (c.amount <= 0)
          return `Nominal biaya tambahan ${label} harus lebih dari 0`;
      }
    }
    return '';
  };

  // Confirm popup: transfer more than distributed (-> deposit) or invoices
  // that stay (partly) unpaid.
  const hasWarning = unallocated > EPSILON || sumRemaining > EPSILON;

  const handleSubmitClick = (): void => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    if (hasWarning) {
      setConfirmOpen(true);
      return;
    }
    void doSubmit();
  };

  const doSubmit = async (): Promise<void> => {
    setConfirmOpen(false);
    try {
      setSubmitting(true);

      let proofName = '';
      if (selectedFile) proofName = await handleFileUpload(selectedFile);

      const payload = {
        customer_id: customerId,
        // money into kas: transfer minus costs (excess over the invoices
        // stays in here; BE turns it into deposit)
        payment_amount: kasMasuk,
        payment_proof: proofName,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        bank: bank.trim(),
        account_number: accountNumber.trim(),
        note: note.trim(),
        invoices: rows
          .filter((r) => r.entered > 0)
          .map((r) => ({
            invoice_id: r.inv.id,
            payment_amount: r.cash,
            additional_costs: (costs[r.inv.id] || []).map((c) => ({
              name: c.type === 'Lainnya' ? c.customName.trim() : c.type,
              amount: c.amount,
              note: c.note.trim(),
            })),
          })),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_LINK}/invoice/payment`,
        payload,
        { withCredentials: true },
      );

      if (res.data?.success === false) {
        setError(res.data?.message || 'Gagal menyimpan pembayaran');
        return;
      }

      alert('Pembayaran berhasil disimpan!');
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Terjadi kesalahan saat menyimpan pembayaran',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const amountInputCls = `${inputCls} text-right`;
  const skippedInvoices = rows.filter((r) => r.entered <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-60"
        onClick={submitting ? undefined : onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-6xl max-h-[96vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="min-w-0">
            <h3 className="text-lg font-bold">Input Pembayaran</h3>
            <p className="text-sm text-green-100 truncate">
              {customerName} · {invoices.length} invoice
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[11px] text-green-100">Total Outstanding</p>
            <p className="text-lg font-bold">
              {formatCurrency(sumOutstanding)}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-2xl leading-none font-bold hover:text-green-200"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ───────── LEFT: transfer + invoices ───────── */}
            <div className="lg:col-span-3 space-y-4">
              {/* Step 1: transfer */}
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  1. Nominal Transfer Customer (sesuai bukti)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rp</span>
                  <NumberInput
                    value={transfer}
                    onChange={handleTransferChange}
                    className={`${amountInputCls} text-base font-semibold bg-white`}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Nominal ini otomatis dibagikan ke invoice berurutan. Boleh
                  lebih besar dari total invoice — kelebihannya masuk deposit.
                </p>
              </div>

              {/* Step 2: distribution */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  2. Distribusi ke Invoice ({invoices.length})
                </h4>
                <button
                  type="button"
                  onClick={() => autoDistribute()}
                  className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded px-3 py-1.5"
                >
                  Distribusi otomatis
                </button>
              </div>

              {rows.map((r) => {
                const inv = r.inv;
                const invCosts = costs[inv.id] || [];
                const over = r.entered - r.outstanding > EPSILON;
                const negativeCash = r.cash < 0;
                const status =
                  r.entered <= 0
                    ? {
                        text: 'Tidak dibayar',
                        cls: 'bg-gray-100 text-gray-600',
                      }
                    : Math.abs(r.remaining) <= EPSILON
                    ? { text: 'Lunas', cls: 'bg-green-100 text-green-700' }
                    : r.remaining > 0
                    ? {
                        text: `Sisa ${formatCurrency(r.remaining)}`,
                        cls: 'bg-amber-100 text-amber-700',
                      }
                    : {
                        text: 'Melebihi outstanding',
                        cls: 'bg-red-100 text-red-700',
                      };

                return (
                  <div
                    key={inv.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Invoice info */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {inv.no_invoice}
                        </p>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}
                        >
                          {status.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-[11px]">
                        <div>
                          <p className="text-gray-400">No DO</p>
                          <p
                            className="text-gray-700 truncate"
                            title={inv.no_do}
                          >
                            {inv.no_do || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">No PO</p>
                          <p className="text-gray-700 truncate">
                            {inv.no_po || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tgl Faktur</p>
                          <p className="text-gray-700">
                            {formatDate(inv.tgl_faktur)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Jatuh Tempo</p>
                          <p className="text-gray-700">
                            {formatDate(inv.tgl_jatuh_tempo)}
                          </p>
                          <p className="text-gray-500">{inv.due_description}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Invoice</p>
                          <p className="text-gray-900 font-medium">
                            {formatCurrency(inv.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Sudah Dibayar</p>
                          <p className="text-green-700 font-medium">
                            {formatCurrency(inv.paid_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Outstanding</p>
                          <p className="text-red-600 font-bold">
                            {formatCurrency(r.outstanding)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Sisa Setelah Bayar</p>
                          <p className="text-gray-900 font-medium">
                            {formatCurrency(Math.max(r.remaining, 0))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Distribution input */}
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nominal dialokasikan dari transfer (maks{' '}
                          {formatCurrency(r.outstanding)})
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Rp</span>
                          <NumberInput
                            value={r.entered}
                            onChange={(v) => setAmount(inv.id, v)}
                            className={`${amountInputCls} ${
                              over || negativeCash
                                ? 'border-red-400 bg-red-50'
                                : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setAmount(inv.id, r.outstanding)}
                            className="text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded px-3 py-2 whitespace-nowrap"
                          >
                            Lunas
                          </button>
                        </div>
                        {over && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Nominal tidak boleh melebihi outstanding invoice.
                          </p>
                        )}
                        {negativeCash && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Biaya tambahan melebihi nominal yang dialokasikan.
                          </p>
                        )}
                      </div>

                      {/* Additional costs */}
                      <div className="rounded-lg border border-dashed border-gray-300 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-700">
                            Biaya Tambahan
                          </p>
                          <button
                            type="button"
                            onClick={() => addCost(inv.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            + Tambah biaya
                          </button>
                        </div>

                        {invCosts.length === 0 ? (
                          <p className="text-[11px] text-gray-400">
                            Belum ada biaya tambahan (pajak, biaya admin, dll).
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400">
                            Biaya dipotong otomatis dari nominal yang
                            dialokasikan; invoice tetap terhitung sebesar
                            nominal tersebut.
                          </p>
                        )}

                        {invCosts.map((c) => (
                          <div
                            key={c.id}
                            className="grid grid-cols-12 gap-2 items-start"
                          >
                            <div className="col-span-12 sm:col-span-4 space-y-1">
                              <select
                                value={c.type}
                                onChange={(e) =>
                                  updateCost(inv.id, c.id, {
                                    type: e.target.value as CostType,
                                  })
                                }
                                className={`${inputCls} bg-white`}
                              >
                                {COST_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              {c.type === 'Lainnya' && (
                                <input
                                  type="text"
                                  value={c.customName}
                                  onChange={(e) =>
                                    updateCost(inv.id, c.id, {
                                      customName: e.target.value,
                                    })
                                  }
                                  placeholder="Nama biaya"
                                  className={inputCls}
                                />
                              )}
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                              <NumberInput
                                value={c.amount}
                                onChange={(v) =>
                                  updateCost(inv.id, c.id, { amount: v })
                                }
                                placeholder="Nominal"
                                className={amountInputCls}
                              />
                            </div>
                            <div className="col-span-5 sm:col-span-4">
                              <input
                                type="text"
                                value={c.note}
                                onChange={(e) =>
                                  updateCost(inv.id, c.id, {
                                    note: e.target.value,
                                  })
                                }
                                placeholder="Catatan (mis. potongan bank)"
                                className={inputCls}
                              />
                            </div>
                            <div className="col-span-1 flex justify-center pt-2">
                              <button
                                type="button"
                                onClick={() => removeCost(inv.id, c.id)}
                                className="text-red-400 hover:text-red-600"
                                aria-label="Hapus biaya"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Per-invoice breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-gray-50 rounded-lg py-2">
                        <div>
                          <p className="text-gray-400">Masuk kas</p>
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(r.cash)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Biaya tambahan</p>
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(r.costTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Mengurangi tagihan</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(r.entered)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ───────── RIGHT: summary + details + proof ───────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Summary */}
              <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-2 text-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Ringkasan
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total outstanding</span>
                  <span className="font-medium">
                    {formatCurrency(sumOutstanding)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nominal transfer</span>
                  <span className="font-medium">
                    {formatCurrency(transfer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Terdistribusi ke invoice
                  </span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(sumEntered)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya tambahan</span>
                  <span className="font-medium">
                    {formatCurrency(sumCosts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Masuk kas</span>
                  <span className="font-medium">
                    {formatCurrency(kasMasuk)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span className="text-gray-600">Sisa tagihan</span>
                  <span
                    className={`font-semibold ${
                      sumRemaining > EPSILON
                        ? 'text-amber-700'
                        : 'text-green-700'
                    }`}
                  >
                    {formatCurrency(sumRemaining)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sisa transfer (deposit)</span>
                  <span
                    className={`font-semibold ${
                      unallocated > EPSILON
                        ? 'text-blue-700'
                        : unallocated < -EPSILON
                        ? 'text-red-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {formatCurrency(unallocated)}
                  </span>
                </div>

                {unallocated > EPSILON && (
                  <div className="text-xs rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-3 py-2">
                    Transfer <b>lebih {formatCurrency(unallocated)}</b> dari
                    total distribusi invoice. Kelebihan akan masuk deposit
                    customer.
                  </div>
                )}
                {unallocated < -EPSILON && (
                  <div className="text-xs rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2">
                    Total distribusi melebihi nominal transfer sebesar{' '}
                    <b>{formatCurrency(-unallocated)}</b>. Kurangi nominal
                    invoice.
                  </div>
                )}
                {sumRemaining > EPSILON && (
                  <div className="text-xs rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2">
                    Pembayaran <b>kurang {formatCurrency(sumRemaining)}</b> dari
                    total outstanding. Invoice akan berstatus sebagian lunas.
                  </div>
                )}
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tanggal Pembayaran
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`${inputCls} bg-white`}
                  >
                    <option value="transfer">Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="giro">Giro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    placeholder="BCA"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    No. Rekening
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Proof upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Bukti Pembayaran
                </label>

                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {!filePreview && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={submitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  )}

                  {filePreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <img
                          src={filePreview}
                          alt="Bukti pembayaran"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setIsFullscreen(true)}
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Klik gambar untuk memperbesar
                      </p>
                      <button
                        type="button"
                        onClick={clearFile}
                        disabled={submitting}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Hapus file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">
                          Klik untuk upload
                        </span>{' '}
                        atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG hingga 1MB
                      </p>
                      <label
                        className={`relative z-10 inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer ${
                          processingPdf || submitting ? 'opacity-50' : ''
                        }`}
                      >
                        {processingPdf
                          ? 'Processing PDF...'
                          : 'atau upload PDF & pilih halaman'}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfSelect}
                          className="hidden"
                          disabled={processingPdf || submitting}
                        />
                      </label>
                    </div>
                  )}
                </div>
                {fileError && (
                  <p className="text-red-500 text-xs mt-2">{fileError}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-gray-500">Nominal transfer: </span>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(transfer)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning / confirmation popup — OK still sends the request */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-3 bg-amber-500 text-white font-bold text-sm">
              Konfirmasi pembayaran
            </div>
            <div className="p-5 space-y-3 text-sm text-gray-700">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Nominal transfer</span>
                  <b>{formatCurrency(transfer)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Terdistribusi ke invoice</span>
                  <b>{formatCurrency(sumEntered)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Biaya tambahan</span>
                  <b>{formatCurrency(sumCosts)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Masuk kas</span>
                  <b>{formatCurrency(kasMasuk)}</b>
                </div>
              </div>

              {unallocated > EPSILON && (
                <p>
                  Transfer{' '}
                  <b className="text-blue-700">
                    lebih {formatCurrency(unallocated)}
                  </b>{' '}
                  dari total invoice yang dibayar. Kelebihan ini akan dicatat
                  sebagai <b>deposit</b> customer.
                </p>
              )}
              {sumRemaining > EPSILON && (
                <p>
                  Pembayaran{' '}
                  <b className="text-amber-700">
                    kurang {formatCurrency(sumRemaining)}
                  </b>{' '}
                  dari total outstanding. Invoice terkait akan berstatus
                  sebagian lunas.
                </p>
              )}
              {skippedInvoices.length > 0 && (
                <p className="text-xs text-gray-500">
                  Invoice dengan nominal 0 tidak ikut dikirim:{' '}
                  {skippedInvoices.map((r) => r.inv.no_invoice).join(', ')}.
                </p>
              )}
              <p className="text-xs text-gray-500">
                Klik OK untuk tetap menyimpan dengan nominal di atas.
              </p>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                Kembali
              </button>
              <button
                onClick={() => void doSubmit()}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                OK, simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen preview */}
      {isFullscreen && filePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[70] overflow-auto"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative w-full min-h-screen flex justify-center p-4">
            <img
              src={filePreview}
              alt="Fullscreen"
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

      {/* PDF page picker */}
      {showPdfPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h4 className="text-sm font-bold text-gray-800">
                Pilih halaman sebagai bukti pembayaran
              </h4>
              <button
                onClick={() => {
                  setShowPdfPicker(false);
                  setPdfPages([]);
                }}
                className="text-2xl leading-none font-bold text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3">
              {pdfPages.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickPdfPage(src)}
                  className="border-2 border-gray-200 hover:border-green-500 rounded-lg overflow-hidden text-left transition-colors"
                >
                  <img src={src} alt={`Page ${idx + 1}`} className="w-full" />
                  <div className="text-center text-xs font-semibold text-gray-600 py-1 bg-gray-50">
                    Halaman {idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentARModal;
