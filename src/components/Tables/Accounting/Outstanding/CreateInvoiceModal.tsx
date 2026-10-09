import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface DOItem {
  id: number;
  id_do_group: number | null;
  id_io: number;
  id_jo: number;
  id_so: number;
  id_customer: number;
  id_produk: number | null;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string | null;
  produk: string | null;
  po_qty: number;
  jumlah_qty: number | null;
  pack_1: number | null;
  pack_2: number | null;
  pack_3: number | null;
  isi_1: number | null;
  isi_2: number | null;
  isi_3: number | null;
  tgl_pengiriman: string;
  tgl_do: string;
  toleransi_pengiriman: number | null;
  note: string | null;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceProduct {
  id_produk: number;
  nama_produk: string;
  kode_produk: string;
  qty: number;
  unit: string;
  harga: number;
  dpp: number;
  total: number;
  pajak: number;
  diskon_produk: number;
  no_do?: string;
}

interface DeliveryOrderGroupItem {
  id: number;
  no_do: string;
}

interface DepositSaldoResponse {
  status: number;
  success: boolean;
  data: {
    id: number;
    nama_customer: string;
    saldo: number;
  };
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDOGroups: number[];
  selectedDOItems: DOItem[];
  customerId: number;
  onInvoiceCreated: () => void;
}

/* ---------------------------------------------------------------------------
 * NumberInput — text input formatted with id-ID thousands separators
 * ("1.000") that also accepts a comma as the decimal separator ("0,64").
 * Always reports a plain number to `onChange`.
 * `decimals` = max fraction digits (default 2, use 0 for whole numbers).
 * ------------------------------------------------------------------------- */

const EPSILON = 1e-9;

const sanitizeNumericInput = (raw: string, decimals: number): string => {
  let out = '';
  let commaUsed = false;
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',' && decimals > 0 && !commaUsed) {
      out += ',';
      commaUsed = true;
    }
  }
  return out;
};

const parseNumberID = (raw: string, decimals: number): number => {
  const sanitized = sanitizeNumericInput(raw, decimals);
  if (!sanitized) return 0;
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intPart = intPartRaw || '0';
  const fracPart = fracPartRaw ? fracPartRaw.slice(0, decimals) : '';
  const parsed = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const roundToPrecision = (value: number, decimals: number): number => {
  if (!value) return 0;
  const f = Math.pow(10, decimals);
  const rounded = Math.round(value * f) / f;
  if (rounded === 0 && value > 0) return 1 / f;
  if (rounded === 0 && value < 0) return -1 / f;
  return rounded;
};

const formatNumberID = (value: number, decimals: number): string => {
  if (!value) return '';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const formatTypingDisplay = (sanitized: string, decimals: number): string => {
  if (!sanitized) return '';
  const hasComma = sanitized.includes(',');
  const [intPartRaw, fracPartRaw] = sanitized.split(',');
  const intDigits = (intPartRaw || '').replace(/^0+(?=\d)/, '') || '0';
  const groupedInt = Number(intDigits).toLocaleString('id-ID');
  const fracPart = hasComma ? (fracPartRaw || '').slice(0, decimals) : '';
  return hasComma ? `${groupedInt},${fracPart}` : groupedInt;
};

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  decimals?: number;
  disabled?: boolean;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  placeholder,
  min = 0,
  decimals = 2,
  disabled,
}) => {
  const [display, setDisplay] = useState<string>(() =>
    formatNumberID(roundToPrecision(value, decimals), decimals),
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync when the value changes from OUTSIDE, never while the user is typing.
  useEffect(() => {
    if (isFocused) return;
    const r = roundToPrecision(value, decimals);
    setDisplay(formatNumberID(r, decimals));
    if (Math.abs(r - value) > EPSILON) onChange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  return (
    <input
      type="text"
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      value={display}
      placeholder={placeholder ?? '0'}
      disabled={disabled}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = Math.max(
          roundToPrecision(parseNumberID(display, decimals), decimals),
          min,
        );
        setDisplay(parsed === 0 ? '' : formatNumberID(parsed, decimals));
        onChange(parsed);
      }}
      onChange={(e) => {
        const sanitized = sanitizeNumericInput(e.target.value, decimals);
        setDisplay(formatTypingDisplay(sanitized, decimals));
        onChange(Math.max(parseNumberID(sanitized, decimals), min));
      }}
      className={className}
    />
  );
};

/* ---------------------------------------------------------------------------
 * Date helpers (local time, no UTC shifting)
 * ------------------------------------------------------------------------- */

const toInputDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return toInputDate(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/** "YYYY-MM-DD" + N days -> "YYYY-MM-DD" (local, safe across month ends) */
const addDaysToInputDate = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  return toInputDate(new Date(y, m - 1, d + days));
};

/* ---------------------------------------------------------------------------
 * Amount helper — one single formula for DPP / PPN so the numbers stay
 * consistent both on initial load and after changing the discount.
 * ------------------------------------------------------------------------- */
const computeAmounts = (qty: number, harga: number, diskon: number) => {
  const total = qty * harga - diskon;
  const dpp = (11 / 12) * total;
  const pajak = dpp * 0.12;
  return { total, dpp, pajak };
};

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  selectedDOItems,
  customerId,
  onInvoiceCreated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceProducts, setInvoiceProducts] = useState<InvoiceProduct[]>([]);

  // Form fields - all dates as strings
  const [noPO, setNoPO] = useState<string>('');
  const [tglPO, setTglPO] = useState<string>('');
  const [noDO, setNoDO] = useState<string>('');
  const [tglKirim, setTglKirim] = useState<string>('');
  const [pelanggan, setPelanggan] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');
  // Number of days (default from detail_customer.top_faktur, editable)
  const [topDays, setTopDays] = useState<number>(30);
  const [catatan, setCatatan] = useState<string>('');
  const [isShowDPP, setIsShowDPP] = useState<boolean>(false);
  const [dp, setDP] = useState<number>(0);
  const [tglKirimError, setTglKirimError] = useState<string>('');

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositError, setDepositError] = useState<string>('');
  const [depositSaldo, setDepositSaldo] = useState<number>(0);
  const [depositCustomerName, setDepositCustomerName] = useState<string>('');
  const [depositUseAmount, setDepositUseAmount] = useState<number>(0);

  // Tanggal faktur ALWAYS follows tanggal kirim
  const tglFaktur = tglKirim;

  // Locked: always tglFaktur + topDays
  const tglJatuhTempo = useMemo(
    () => addDaysToInputDate(tglFaktur, topDays),
    [tglFaktur, topDays],
  );
  // Same string format as before, sent to the API
  const waktuJatuhTempo = `${topDays} Hari`;

  useEffect(() => {
    if (isOpen && selectedDOItems.length > 0) {
      processDataFromSelectedItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDOItems]);

  // Reset deposit state each time the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setDP(0);
      setIsDepositModalOpen(false);
      setDepositUseAmount(0);
      setDepositError('');
    }
  }, [isOpen]);

  const fetchInvoiceNumber = async (tglKirimValue: string) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/invoiceNomor`,
        {
          params: { tgl_kirim: tglKirimValue },
          withCredentials: true,
        },
      );
      console.log('Invoice number response:', res.data);
      setInvoiceNumber(res.data.new_no_invoice || '');
    } catch (error) {
      console.error('Error fetching invoice number:', error);
      setInvoiceNumber('');
      alert('Gagal mengambil nomor invoice. Silakan coba lagi.');
    }
  };

  const fetchDepositSaldo = async () => {
    setDepositLoading(true);
    setDepositError('');
    try {
      const res = await axios.get<DepositSaldoResponse>(
        `${import.meta.env.VITE_API_LINK}/depositSaldo`,
        {
          params: { id_customer: customerId },
          withCredentials: true,
        },
      );
      console.log('Deposit saldo response:', res.data);
      setDepositSaldo(res.data?.data?.saldo || 0);
      setDepositCustomerName(res.data?.data?.nama_customer || pelanggan);
    } catch (error) {
      console.error('Error fetching deposit saldo:', error);
      setDepositSaldo(0);
      setDepositError('Gagal mengambil saldo deposit customer.');
    } finally {
      setDepositLoading(false);
    }
  };

  const processDataFromSelectedItems = () => {
    try {
      if (selectedDOItems.length === 0) {
        return;
      }

      const firstItem = selectedDOItems[0] as any;

      setNoPO(firstItem.no_po_customer || '');
      setTglPO(formatDateForInput(firstItem.so?.tgl_po_customer || ''));

      const allDONumbers = selectedDOItems
        .map((item: any) => item.no_do)
        .filter((no) => no)
        .join(', ');
      setNoDO(allDONumbers || firstItem.no_do || '');

      // Tanggal kirim (mandatory) — also drives tanggal faktur & nomor invoice
      const kirim = formatDateForInput(firstItem.tgl_do || '');
      setTglKirim(kirim);

      if (!kirim) {
        setTglKirimError(
          'Tanggal kirim tidak ditemukan pada data delivery order. Nomor invoice dan tanggal faktur tidak dapat dibuat.',
        );
        setInvoiceNumber('');
        alert(
          'Tanggal kirim tidak ditemukan pada data delivery order. Invoice tidak dapat dibuat.',
        );
      } else {
        setTglKirimError('');
        fetchInvoiceNumber(kirim);
      }

      setPelanggan(firstItem.customer || '');
      setAlamat(
        firstItem.detail_customer?.alamat_penagihan || firstItem.alamat || '',
      );

      const top = parseInt(firstItem.detail_customer?.top_faktur, 10);
      setTopDays(Number.isNaN(top) ? 30 : top);

      processProducts(selectedDOItems);
    } catch (error) {
      console.error('Error processing data from selected items:', error);
    }
  };

  const processProducts = (items: DOItem[]) => {
    const products: InvoiceProduct[] = [];

    items.forEach((item: any) => {
      if (item.delivery_order && Array.isArray(item.delivery_order)) {
        item.delivery_order.forEach((order: any) => {
          if (!order.id_produk) return;

          const qty = order.jumlah_qty || 0;
          const harga = order.so?.harga_jual || 0;
          const diskonProduk = 0;
          const { total, dpp, pajak } = computeAmounts(
            qty,
            harga,
            diskonProduk,
          );

          const product: InvoiceProduct = {
            id_produk: order.id_produk,
            nama_produk: order.produk || '',
            no_do: item.no_do || '',
            kode_produk: `P-${String(order.id_produk).padStart(5, '0')}`,
            qty: qty,
            unit: 'PCS',
            harga: harga,
            dpp: dpp,
            total: total,
            pajak: pajak,
            diskon_produk: diskonProduk,
          };

          products.push(product);
        });
      } else {
        if (item.id_produk) {
          const qty = item.jumlah_qty || item.po_qty || 0;
          const harga = item.so?.harga_jual || 0;
          const diskonProduk = 0;
          const { total, dpp, pajak } = computeAmounts(
            qty,
            harga,
            diskonProduk,
          );

          const product: InvoiceProduct = {
            id_produk: item.id_produk,
            nama_produk: item.produk || '',
            kode_produk: `P-${String(item.id_produk).padStart(5, '0')}`,
            qty: qty,
            unit: 'PCS',
            harga: harga,
            dpp: dpp,
            total: total,
            pajak: pajak,
            diskon_produk: diskonProduk,
          };

          products.push(product);
        }
      }
    });

    setInvoiceProducts(products);
  };

  const handleDiskonProdukChange = (index: number, value: number) => {
    const updatedProducts = [...invoiceProducts];
    const product = updatedProducts[index];
    const { total, dpp, pajak } = computeAmounts(
      product.qty,
      product.harga,
      value,
    );

    updatedProducts[index] = {
      ...product,
      diskon_produk: value,
      total: total,
      pajak: pajak,
      dpp: dpp,
    };

    setInvoiceProducts(updatedProducts);
  };

  const calculateTotals = () => {
    const subTotal = invoiceProducts.reduce(
      (sum, product) => sum + product.total,
      0,
    );
    const totalPajak = invoiceProducts.reduce(
      (sum, product) => sum + product.pajak,
      0,
    );
    const totalDPP = invoiceProducts.reduce(
      (sum, product) => sum + product.dpp,
      0,
    );
    const diskon = invoiceProducts.reduce(
      (sum, product) => sum + product.diskon_produk,
      0,
    );
    const grossTotal = subTotal + totalPajak; // total invoice before DP
    const balanceDue = grossTotal - dp;

    return {
      subTotal,
      totalDPP,
      diskon,
      totalPajak,
      grossTotal,
      balanceDue,
    };
  };

  const totals = calculateTotals();

  // If total invoice drops below the DP (e.g. discount increased), clamp DP
  useEffect(() => {
    const maxDP = Math.max(0, Math.round(totals.grossTotal));
    if (dp > maxDP) setDP(maxDP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.grossTotal]);

  // Build delivery_order_group from the selected DO items
  const buildDeliveryOrderGroup = (): DeliveryOrderGroupItem[] => {
    return selectedDOItems
      .filter((item: any) => item.id && item.no_do)
      .map((item: any) => ({
        id: item.id,
        no_do: item.no_do,
      }));
  };

  /* ----------------------------- Deposit modal ---------------------------- */

  // The most that can be taken: limited by saldo and by the invoice total
  const maxDepositUsable = Math.max(
    0,
    Math.min(depositSaldo, Math.round(totals.grossTotal)),
  );

  const openDepositModal = () => {
    setDepositUseAmount(dp);
    setIsDepositModalOpen(true);
    fetchDepositSaldo();
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setDepositError('');
  };

  const depositAmountError =
    depositUseAmount > depositSaldo
      ? 'Jumlah melebihi saldo deposit.'
      : depositUseAmount > Math.round(totals.grossTotal)
      ? 'Jumlah melebihi total invoice.'
      : '';

  const handleApplyDeposit = () => {
    if (depositAmountError) return;
    setDP(depositUseAmount);
    closeDepositModal();
  };

  const handleSubmit = async () => {
    if (!tglKirim) {
      alert('Tanggal kirim wajib ada. Invoice tidak dapat dibuat.');
      return;
    }
    if (!invoiceNumber) {
      alert('Nomor invoice belum tersedia. Silakan coba lagi.');
      return;
    }

    try {
      const payload = {
        id_customer: customerId,
        nama_customer: pelanggan,
        no_po: noPO,
        no_invoice: invoiceNumber,
        tgl_po: tglPO,
        no_do: noDO,
        tgl_kirim: tglKirim,
        alamat: alamat,
        tgl_faktur: tglFaktur,
        tgl_jatuh_tempo: tglJatuhTempo,
        waktu_jatuh_tempo: waktuJatuhTempo,
        sub_total: totals.subTotal,
        dpp: totals.totalDPP,
        diskon: totals.diskon,
        ppn: totals.totalPajak,
        total: totals.balanceDue,
        balance_due: totals.balanceDue,
        dp: dp,
        note: catatan,
        is_show_dpp: isShowDPP,
        invoice_produk: invoiceProducts,
        delivery_order_group: buildDeliveryOrderGroup(),
      };
      console.log('Submitting invoice payload:', payload);

      await axios.post(`${import.meta.env.VITE_API_LINK}/invoice`, payload, {
        withCredentials: true,
      });

      alert('Invoice created successfully!');
      onInvoiceCreated();
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      alert('Failed to create invoice. Please try again.');
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Sales Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="flex-1 overflow-y-auto p-4">
          {tglKirimError && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
              {tglKirimError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex gap-4">
              {/* Left Column - 30% */}
              <div className="w-[30%] shrink-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor PO
                    </label>
                    <input
                      type="text"
                      value={noPO}
                      onChange={(e) => setNoPO(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal PO
                    </label>
                    <input
                      type="date"
                      value={tglPO}
                      onChange={(e) => setTglPO(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor DO
                    </label>
                    <input
                      type="text"
                      value={noDO}
                      onChange={(e) => setNoDO(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Kirim
                    </label>
                    <input
                      type="date"
                      value={tglKirim}
                      className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none bg-gray-50 cursor-not-allowed ${
                        tglKirimError ? 'border-red-400' : 'border-gray-300'
                      }`}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nomor Sales Invoice
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pelanggan
                  </label>
                  <input
                    type="text"
                    value={pelanggan}
                    onChange={(e) => setPelanggan(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Faktur (= Tgl Kirim)
                    </label>
                    <input
                      type="date"
                      value={tglFaktur}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none bg-gray-50 cursor-not-allowed"
                      readOnly
                      tabIndex={-1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Waktu Jatuh Tempo (Hari)
                    </label>
                    <NumberInput
                      value={topDays}
                      onChange={setTopDays}
                      decimals={0}
                      placeholder="30"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tanggal Jatuh Tempo (otomatis)
                  </label>
                  <input
                    type="date"
                    value={tglJatuhTempo}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none bg-gray-50 cursor-not-allowed"
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add notes here..."
                  />
                </div>
              </div>

              {/* Right Column - 70% */}
              <div className="flex-1 space-y-3 flex flex-col min-w-0">
                {/* Products Table */}
                <div className="bg-white border border-gray-200 rounded overflow-hidden flex-1 flex flex-col">
                  <div className="overflow-auto flex-1 max-h-[calc(95vh-250px)]">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            No
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Nama Barang
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            QTY
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Harga
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            DPP
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Diskon
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Total
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Pajak
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoiceProducts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-3 py-4 text-center text-gray-500 text-xs"
                            >
                              No products available
                            </td>
                          </tr>
                        ) : (
                          invoiceProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {index + 1}
                              </td>
                              <td
                                className="px-2 py-1.5 text-xs text-gray-900 max-w-[120px]"
                                title={product.nama_produk}
                              >
                                {product.nama_produk}
                              </td>
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {formatNumber(product.qty)}
                              </td>
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {formatNumber(product.harga)}
                              </td>
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {formatNumber(Math.round(product.dpp))}
                              </td>
                              <td className="px-2 py-1.5 text-xs">
                                <NumberInput
                                  value={product.diskon_produk}
                                  onChange={(v) =>
                                    handleDiskonProdukChange(index, v)
                                  }
                                  className="w-24 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                                />
                              </td>
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {formatNumber(Math.round(product.total))}
                              </td>
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {formatNumber(Math.round(product.pajak))}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isShowDPP}
                      onChange={(e) => setIsShowDPP(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Tampilkan DPP (for display only)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      SubTotal
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(Math.round(totals.subTotal))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      DPP (Data)
                    </span>
                    <span className="text-xs text-gray-900">
                      {formatNumber(Math.round(totals.totalDPP))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Diskon
                    </span>
                    <span className="text-xs text-gray-900">
                      {formatNumber(Math.round(totals.diskon))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      PPn
                    </span>
                    <span className="text-xs text-gray-900">
                      {formatNumber(Math.round(totals.totalPajak))}
                    </span>
                  </div>

                  {/* DP — filled via the Deposit modal */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700">
                      DP
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={dp > 0 ? formatNumber(dp) : ''}
                        placeholder="0"
                        readOnly
                        tabIndex={-1}
                        className="w-28 px-2 py-1 border border-gray-300 rounded bg-gray-100 text-xs text-right cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={openDepositModal}
                        disabled={totals.grossTotal <= 0}
                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Gunakan Deposit
                      </button>
                      {dp > 0 && (
                        <button
                          type="button"
                          onClick={() => setDP(0)}
                          title="Reset DP"
                          className="px-2 py-1 text-xs font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-1.5">
                    <span className="text-sm font-semibold text-gray-900">
                      Total (Balance Due)
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(Math.round(totals.balanceDue))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              invoiceProducts.length === 0 ||
              !tglKirim ||
              !invoiceNumber
            }
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Deposit Customer
              </h3>
              <button
                onClick={closeDepositModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <div className="p-4 space-y-3">
              {depositLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : depositError ? (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                    {depositError}
                  </div>
                  <button
                    onClick={fetchDepositSaldo}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded p-3 space-y-1">
                    <div className="text-xs text-gray-600">
                      {depositCustomerName || pelanggan}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Sisa Saldo Deposit
                      </span>
                      <span className="text-base font-bold text-blue-700">
                        {formatNumber(depositSaldo)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Total Invoice
                      </span>
                      <span className="text-xs text-gray-900">
                        {formatNumber(Math.round(totals.grossTotal))}
                      </span>
                    </div>
                  </div>

                  {depositSaldo <= 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
                      Customer ini tidak memiliki saldo deposit.
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Jumlah deposit yang digunakan
                        </label>
                        <button
                          type="button"
                          onClick={() => setDepositUseAmount(maxDepositUsable)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Gunakan maksimal ({formatNumber(maxDepositUsable)})
                        </button>
                      </div>
                      <NumberInput
                        value={depositUseAmount}
                        onChange={setDepositUseAmount}
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 text-right ${
                          depositAmountError
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {depositAmountError && (
                        <p className="mt-1 text-xs text-red-600">
                          {depositAmountError}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={closeDepositModal}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApplyDeposit}
                disabled={
                  depositLoading ||
                  !!depositError ||
                  depositSaldo <= 0 ||
                  !!depositAmountError
                }
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terapkan ke DP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoiceModal;
