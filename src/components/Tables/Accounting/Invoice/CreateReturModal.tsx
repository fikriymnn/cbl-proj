// /mnt/data/CreateReturModal.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface InvoiceProduct {
  id: number;
  id_invoice: number;
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
}

interface InvoiceData {
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
  id_customer: number;
  total: number;
  note: string;
  invoice_produk?: InvoiceProduct[];
}

interface CreateReturModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
  onReturCreated: () => void;
}

interface ReturProduct extends InvoiceProduct {
  retur_qty: number;
  qty_produk: number;
}

const CreateReturModal: React.FC<CreateReturModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  onReturCreated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [returNumber, setReturNumber] = useState<string>('');
  const [returProducts, setReturProducts] = useState<ReturProduct[]>([]);
  const [catatan, setCatatan] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchReturNumber();
      initializeReturProducts();
    }
  }, [isOpen, invoiceData]);

  const fetchReturNumber = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/returNomor`,
        {
          withCredentials: true,
        },
      );
      console.log('Retur number response:', res.data);
      // Use new_no_invoice per your API response
      setReturNumber(res.data.new_no_invoice || '');
    } catch (error) {
      console.error('Error fetching retur number:', error);
    }
  };

  const initializeReturProducts = () => {
    const products: ReturProduct[] =
      invoiceData.invoice_produk?.map((product) => ({
        ...product,
        retur_qty: 0,
        qty_produk: product.qty,
      })) ?? [];
    setReturProducts(products);
  };

  /**
   * Normalize date strings for display and payload so they match HTML date input format (YYYY-MM-DD).
   * - Empty/falsy => ''
   * - Already in YYYY-MM-DD => return as-is
   * - Otherwise parse and return YYYY-MM-DD fallback.
   */
  const normalizeDateForInput = (
    dateString: string | undefined | null,
  ): string => {
    if (!dateString) return '';
    // If already YYYY-MM-DD (common HTML date input value), return it unchanged
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // If ISO datetime like 2025-12-11T10:00:00Z, take the date part
    const isoMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    // Fallback: try to parse with Date and format to YYYY-MM-DD
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // if unparsable, return original to avoid data loss
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleReturQtyChange = (index: number, value: number) => {
    const updatedProducts = [...returProducts];
    const product = updatedProducts[index];

    // Validate that retur qty doesn't exceed original qty
    const newReturQty = Math.min(Math.max(0, value), product.qty_produk);

    updatedProducts[index] = {
      ...product,
      retur_qty: newReturQty,
    };

    setReturProducts(updatedProducts);
  };

  const calculateTotalRetur = () => {
    return returProducts.reduce((sum, product) => {
      return sum + product.retur_qty * product.harga;
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      // Filter only products with retur_qty > 0
      const returProductsToSubmit = returProducts
        .filter((product) => product.retur_qty > 0)
        .map((product) => ({
          id_produk: product.id_produk,
          nama_produk: product.nama_produk,
          kode_produk: product.kode_produk,
          qty: product.retur_qty,
          qty_produk: product.qty_produk,
          unit: product.unit,
          harga: product.harga,
          dpp: (product.retur_qty * product.harga) / 1.11,
          total: product.retur_qty * product.harga,
          pajak:
            product.retur_qty * product.harga -
            (product.retur_qty * product.harga) / 1.11,
        }));

      if (returProductsToSubmit.length === 0) {
        alert('Please enter at least one product quantity for return.');
        return;
      }

      const totalRetur = calculateTotalRetur();

      // Use normalized dates (YYYY-MM-DD) to match input components
      const payload = {
        id_invoice: invoiceData.id,
        id_customer: invoiceData.id_customer,
        nama_customer: invoiceData.nama_customer,
        no_po: invoiceData.no_po,
        no_invoice: invoiceData.no_invoice,
        no_retur: returNumber,
        tgl_po: normalizeDateForInput(invoiceData.tgl_po),
        no_do: invoiceData.no_do,
        tgl_kirim: normalizeDateForInput(invoiceData.tgl_kirim),
        alamat: invoiceData.alamat,
        tgl_faktur: normalizeDateForInput(invoiceData.tgl_faktur),
        tgl_jatuh_tempo: normalizeDateForInput(invoiceData.tgl_jatuh_tempo),
        waktu_jatuh_tempo: invoiceData.waktu_jatuh_tempo,
        total: totalRetur,
        note: catatan,
        retur_produk: returProductsToSubmit,
      };

      console.log('Submitting retur payload:', payload);

      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_LINK}/retur`, payload, {
        withCredentials: true,
      });

      alert('Retur created successfully!');
      onReturCreated();
    } catch (error) {
      console.error('Error creating retur:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      alert('Failed to create retur. Please try again.');
    } finally {
      setLoading(false);
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
            Create Sales Retur
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column - Form Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor PO
                    </label>
                    <input
                      type="text"
                      value={invoiceData.no_po}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal PO
                    </label>
                    <input
                      type="text"
                      value={normalizeDateForInput(invoiceData.tgl_po)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
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
                      value={invoiceData.no_do}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Kirim
                    </label>
                    <input
                      type="text"
                      value={normalizeDateForInput(invoiceData.tgl_kirim)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor Sales Invoice
                    </label>
                    <input
                      type="text"
                      value={invoiceData.no_invoice}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor Sales Retur
                    </label>
                    <input
                      type="text"
                      value={returNumber}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pelanggan
                  </label>
                  <input
                    type="text"
                    value={invoiceData.nama_customer}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={invoiceData.alamat}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Faktur
                    </label>
                    <input
                      type="text"
                      value={normalizeDateForInput(invoiceData.tgl_faktur)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Waktu Jatuh Tempo
                    </label>
                    <input
                      type="text"
                      value={invoiceData.waktu_jatuh_tempo}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="text"
                    value={normalizeDateForInput(invoiceData.tgl_jatuh_tempo)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    readOnly
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

              {/* Right Column - Products Table and Summary */}
              <div className="space-y-3 flex flex-col">
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
                            Kode Barang
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Nama Barang
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            QTY
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            QTY Product
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Unit
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Harga
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">
                            Disc %
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
                        {returProducts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="px-3 py-4 text-center text-gray-500 text-xs"
                            >
                              No products available
                            </td>
                          </tr>
                        ) : (
                          returProducts.map((product, index) => {
                            const returTotal =
                              product.retur_qty * product.harga;
                            const returDPP = returTotal / 1.11;
                            const returPajak = returTotal - returDPP;

                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {product.kode_produk}
                                </td>
                                <td
                                  className="px-2 py-1.5 text-xs text-gray-900 max-w-[120px] truncate"
                                  title={product.nama_produk}
                                >
                                  {product.nama_produk}
                                </td>
                                <td className="px-2 py-1.5 text-xs">
                                  <input
                                    type="number"
                                    value={product.retur_qty}
                                    onChange={(e) =>
                                      handleReturQtyChange(
                                        index,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    max={product.qty_produk}
                                    min={0}
                                    className="w-20 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                  />
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {formatNumber(product.qty_produk)}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {product.unit}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {formatNumber(product.harga)}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  0
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {formatNumber(Math.round(returTotal))}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-900">
                                  {formatNumber(Math.round(returPajak))}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <div className="flex items-center justify-between border-t pt-1.5">
                    <span className="text-sm font-semibold text-gray-900">
                      Total Retur
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatNumber(Math.round(calculateTotalRetur()))}
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
            disabled={loading || returProducts.every((p) => p.retur_qty === 0)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Retur'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReturModal;
