// PaymentARModal.tsx
import axios from 'axios';
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

// Max size for a directly uploaded image (same rule as the karyawan photo: 1MB)
const MAX_FILE_SIZE = 1024 * 1024;

type Num = number | string | null | undefined;

export interface PayableInvoice {
  id: number;
  id_customer: number;
  nama_customer: string;
  no_invoice: string;
  no_do: string;
  tgl_jatuh_tempo: string;
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

const toNum = (v: Num): number => {
  const n = Number(v ?? 0);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (v: Num): string =>
  `Rp ${toNum(v).toLocaleString('id-ID')}`;

const todayLocal = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

const PaymentARModal: React.FC<PaymentARModalProps> = ({
  customerId,
  customerName,
  invoices,
  onClose,
  onSuccess,
}) => {
  // Per-invoice payment amount (default = full outstanding)
  const [amounts, setAmounts] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      invoices.map((i) => [i.id, String(toNum(i.outstanding_amount))]),
    ),
  );
  const [paymentDate, setPaymentDate] = useState<string>(todayLocal());
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [bank, setBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Proof file (same flow as GeneralTab: image directly, or PDF → pick a page)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [showPdfPicker, setShowPdfPicker] = useState<boolean>(false);
  const [processingPdf, setProcessingPdf] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const totalPayment = invoices.reduce(
    (sum, i) => sum + toNum(amounts[i.id]),
    0,
  );

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
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

    for (const inv of invoices) {
      const amt = toNum(amounts[inv.id]);
      const max = toNum(inv.outstanding_amount);
      if (amt <= 0) return `Nominal ${inv.no_invoice} harus lebih dari 0`;
      if (amt > max)
        return `Nominal ${
          inv.no_invoice
        } melebihi outstanding (${formatCurrency(max)})`;
    }
    return '';
  };

  const handleSubmit = async (): Promise<void> => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');

    try {
      setSubmitting(true);

      let proofName = '';
      if (selectedFile) proofName = await handleFileUpload(selectedFile);

      const payload = {
        customer_id: customerId,
        payment_amount: String(totalPayment),
        payment_proof: proofName,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        bank: bank.trim(),
        account_number: accountNumber.trim(),
        note: note.trim(),
        invoices: invoices.map((inv) => ({
          invoice_id: inv.id,
          payment_amount: String(toNum(amounts[inv.id])),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-h-screen overflow-hidden flex flex-col">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={submitting ? undefined : onClose}
        ></div>

        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div>
              <h3 className="text-base font-bold">Input Pembayaran</h3>
              <p className="text-xs text-green-100 mt-0.5">{customerName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-2xl leading-none font-bold hover:text-green-200"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-4 max-h-[calc(100vh-220px)] overflow-y-auto space-y-5">
            {/* Invoices */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Invoice Dibayar ({invoices.length})
              </h4>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const max = toNum(inv.outstanding_amount);
                  const amt = toNum(amounts[inv.id]);
                  const over = amt > max;
                  return (
                    <div
                      key={inv.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {inv.no_invoice}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {inv.no_do}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Outstanding:{' '}
                          <span className="font-semibold text-red-600">
                            {formatCurrency(max)}
                          </span>{' '}
                          · {inv.due_description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:w-64">
                        <input
                          type="number"
                          min={0}
                          max={max}
                          value={amounts[inv.id] ?? ''}
                          onChange={(e) =>
                            setAmounts((p) => ({
                              ...p,
                              [inv.id]: e.target.value,
                            }))
                          }
                          className={`${inputCls} text-right ${
                            over ? 'border-red-400 bg-red-50' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAmounts((p) => ({ ...p, [inv.id]: String(max) }))
                          }
                          className="text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded px-2 py-1.5 whitespace-nowrap"
                        >
                          Lunas
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <span className="text-sm font-semibold text-gray-700">
                  Total Pembayaran
                </span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(totalPayment)}
                </span>
              </div>
            </div>

            {/* Payment details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
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
                {/* Click-anywhere input only while there is no preview,
                    so the preview stays clickable for fullscreen */}
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
                    {/* PDF option, sits above the click-anywhere input */}
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

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </div>
      </div>

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
