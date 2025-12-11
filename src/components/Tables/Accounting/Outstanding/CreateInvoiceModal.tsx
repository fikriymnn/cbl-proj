import React, { useEffect, useState } from 'react';
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
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDOGroups: number[];
  selectedDOItems: DOItem[];
  customerId: number;
  onInvoiceCreated: () => void;
}

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
  const [tglFaktur, setTglFaktur] = useState<string>('');
  const [tglJatuhTempo, setTglJatuhTempo] = useState<string>('');
  const [waktuJatuhTempo, setWaktuJatuhTempo] = useState<string>('30 Hari');
  const [catatan, setCatatan] = useState<string>('');
  const [isShowDPP, setIsShowDPP] = useState<boolean>(false);
  const [dp, setDP] = useState<number>(0);

  useEffect(() => {
    if (isOpen && selectedDOItems.length > 0) {
      fetchInvoiceNumber();
      processDataFromSelectedItems();
    }
  }, [isOpen, selectedDOItems]);

  useEffect(() => {
    if (tglFaktur && waktuJatuhTempo) {
      calculateJatuhTempo();
    }
  }, [tglFaktur, waktuJatuhTempo]);

  const fetchInvoiceNumber = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/invoiceNomor`,
        {
          withCredentials: true,
        },
      );
      console.log('Invoice number response:', res.data);
      setInvoiceNumber(res.data.new_no_invoice || '');
    } catch (error) {
      console.error('Error fetching invoice number:', error);
    }
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
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

      setTglKirim(formatDateForInput(firstItem.tgl_pengiriman || ''));
      setPelanggan(firstItem.customer || '');
      setAlamat(
        firstItem.detail_customer?.alamat_kantor || firstItem.alamat || '',
      );
      setTglFaktur(formatDateForInput(new Date().toISOString()));
      setWaktuJatuhTempo(
        `${firstItem.detail_customer?.top_faktur || '30'} Hari`,
      );

      processProducts(selectedDOItems);
    } catch (error) {
      console.error('Error processing data from selected items:', error);
    }
  };

  const processProducts = (items: DOItem[]) => {
    const productMap = new Map<
      number,
      {
        nama_produk: string;
        totalQty: number;
        harga: number;
        so: any;
      }
    >();

    items.forEach((item: any) => {
      if (item.delivery_order && Array.isArray(item.delivery_order)) {
        item.delivery_order.forEach((order: any) => {
          if (!order.id_produk) return;

          const qty = order.jumlah_qty || 0;

          if (productMap.has(order.id_produk)) {
            const existing = productMap.get(order.id_produk)!;
            existing.totalQty += qty;
          } else {
            productMap.set(order.id_produk, {
              nama_produk: order.produk || '',
              totalQty: qty,
              harga: item.so?.harga_jual || 0,
              so: item.so,
            });
          }
        });
      } else {
        if (item.id_produk) {
          const qty = item.jumlah_qty || item.po_qty || 0;

          if (productMap.has(item.id_produk)) {
            const existing = productMap.get(item.id_produk)!;
            existing.totalQty += qty;
          } else {
            productMap.set(item.id_produk, {
              nama_produk: item.produk || '',
              totalQty: qty,
              harga: item.so?.harga_jual || 0,
              so: item.so,
            });
          }
        }
      }
    });

    const products: InvoiceProduct[] = [];

    productMap.forEach((value, id_produk) => {
      const { nama_produk, totalQty, harga } = value;
      const diskonProduk = 0;

      const totalBeforeDiscount = totalQty * harga;
      const total = totalBeforeDiscount - diskonProduk;

      const dpp = total / 1.11;
      const pajak = total - dpp;

      const product: InvoiceProduct = {
        id_produk: id_produk,
        nama_produk: nama_produk,
        kode_produk: `P-${String(id_produk).padStart(5, '0')}`,
        qty: totalQty,
        unit: 'PCS',
        harga: harga,
        dpp: dpp,
        total: total,
        pajak: pajak,
        diskon_produk: diskonProduk,
      };

      products.push(product);
    });

    setInvoiceProducts(products);
  };

  const calculateJatuhTempo = () => {
    if (!tglFaktur) return;
    const days = parseInt(waktuJatuhTempo.replace(' Hari', '')) || 30;
    const fakturDate = new Date(tglFaktur);
    fakturDate.setDate(fakturDate.getDate() + days);
    setTglJatuhTempo(formatDateForInput(fakturDate.toISOString()));
  };

  const handleDiskonProdukChange = (index: number, value: number) => {
    const updatedProducts = [...invoiceProducts];
    const product = updatedProducts[index];
    const totalBeforeDiscount = product.qty * product.harga;
    const total = totalBeforeDiscount - value;

    const dpp = total / 1.11;
    const pajak = total - dpp;

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
    const balanceDue = subTotal - dp;

    return {
      subTotal,
      totalDPP,
      diskon,
      totalPajak,
      balanceDue,
    };
  };

  const handleSubmit = async () => {
    try {
      const totals = calculateTotals();
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

  const totals = calculateTotals();

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
                      onChange={(e) => setTglKirim(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      Tanggal Faktur
                    </label>
                    <input
                      type="date"
                      value={tglFaktur}
                      onChange={(e) => setTglFaktur(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Waktu Jatuh Tempo
                    </label>
                    <input
                      type="text"
                      value={waktuJatuhTempo}
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
                    type="date"
                    value={tglJatuhTempo}
                    onChange={(e) => setTglJatuhTempo(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            Kode
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
                              colSpan={9}
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
                              <td className="px-2 py-1.5 text-xs text-gray-900">
                                {product.kode_produk}
                              </td>
                              <td
                                className="px-2 py-1.5 text-xs text-gray-900 max-w-[120px] truncate"
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
                                <input
                                  type="number"
                                  value={product.diskon_produk}
                                  onChange={(e) =>
                                    handleDiskonProdukChange(
                                      index,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-16 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
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

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      DP
                    </span>
                    <input
                      type="number"
                      value={dp}
                      onChange={(e) => setDP(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-right"
                    />
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
            disabled={loading || invoiceProducts.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
