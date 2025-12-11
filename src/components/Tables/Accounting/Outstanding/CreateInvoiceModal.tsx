import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination, Stack } from '@mui/material';

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

interface DeliveryOrder {
  id: number;
  id_do_group: number;
  id_customer: number;
  id_produk: number;
  id_so: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  no_po_customer: string;
  customer: string;
  produk: string;
  jumlah_qty: number;
  tgl_pengiriman: string;
  status: string;
}

interface SO {
  harga_jual: number;
  ppn: string;
  tgl_po_customer: string;
  no_po_customer: string;
}

interface DetailCustomer {
  nama_customer: string;
  alamat_kantor: string;
  top_faktur: string;
}

interface DOGroupData {
  id: number;
  id_customer: number;
  no_do: string;
  tgl_do: string;
  alamat: string;
  customer: string;
  delivery_order: DeliveryOrder[];
  so: SO;
  detail_customer: DetailCustomer;
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
  selectedDOGroups,
  selectedDOItems,
  customerId,
  onInvoiceCreated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceProducts, setInvoiceProducts] = useState<InvoiceProduct[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form fields
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
  const [diskonRetur, setDiskonRetur] = useState<number>(0);
  const [dp, setDP] = useState<number>(0);

  useEffect(() => {
    if (isOpen && selectedDOItems.length > 0) {
      console.log('Modal opened with selectedDOItems:', selectedDOItems);
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

  const processDataFromSelectedItems = () => {
    try {
      console.log('=== Processing Data from Selected Items ===');
      console.log('Selected DO Items:', selectedDOItems);

      if (selectedDOItems.length === 0) {
        console.warn('No selected items available');
        return;
      }

      // Get the first item - it has all the data we need
      const firstItem = selectedDOItems[0] as any; // Cast to any to access nested properties

      console.log('First Item:', firstItem);
      console.log('First Item SO:', firstItem.so);
      console.log('First Item detail_customer:', firstItem.detail_customer);

      // Set form values
      setNoPO(firstItem.no_po_customer || '');
      setTglPO(formatDateForInput(firstItem.so?.tgl_po_customer || ''));

      // Combine all DO numbers from selected items
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

      // Process products
      processProducts(selectedDOItems);
    } catch (error) {
      console.error('Error processing data from selected items:', error);
    }
  };

  const processProducts = (items: DOItem[]) => {
    console.log('=== Processing Products ===');
    console.log('Items to process:', items);

    // Create a map to group products by id_produk and sum their quantities
    const productMap = new Map<
      number,
      {
        nama_produk: string;
        totalQty: number;
        harga: number;
        so: any;
      }
    >();

    items.forEach((item: any, index) => {
      console.log(`\n--- Processing Item ${index + 1} ---`);
      console.log('Item:', item);

      // Check if item has delivery_order array
      if (item.delivery_order && Array.isArray(item.delivery_order)) {
        console.log('Has delivery_order array:', item.delivery_order);

        item.delivery_order.forEach((order: any, orderIndex: number) => {
          console.log(`  Processing delivery_order ${orderIndex}:`, order);

          if (!order.id_produk) {
            console.warn('  No id_produk in delivery order');
            return;
          }

          const qty = order.jumlah_qty || 0;
          console.log(`  Product ID: ${order.id_produk}, Qty: ${qty}`);

          if (productMap.has(order.id_produk)) {
            const existing = productMap.get(order.id_produk)!;
            existing.totalQty += qty;
            console.log(`  Updated qty to: ${existing.totalQty}`);
          } else {
            productMap.set(order.id_produk, {
              nama_produk: order.produk || '',
              totalQty: qty,
              harga: item.so?.harga_jual || 0,
              so: item.so,
            });
            console.log(`  Added new product`);
          }
        });
      } else {
        // If no delivery_order array, process the item itself as a product
        console.log('No delivery_order array, processing item directly');

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

    console.log('\n=== Product Map ===');
    console.log('Product Map:', productMap);

    // Convert map to invoice products array
    const products: InvoiceProduct[] = [];

    productMap.forEach((value, id_produk) => {
      console.log(`\n--- Creating Invoice Product for ID ${id_produk} ---`);
      console.log('Value:', value);

      const { nama_produk, totalQty, harga } = value;
      const diskonProduk = 0;

      const totalBeforeDiscount = totalQty * harga;
      const total = totalBeforeDiscount - diskonProduk;
      const pajak = total * 0.11;
      const dppPercentage = (11 / 111) * 100;
      const dpp = (dppPercentage / 100) * total;

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

      console.log('Created product:', product);
      products.push(product);
    });

    console.log('\n=== Final Products Array ===');
    console.log('Total products:', products.length);
    console.log('Products:', products);

    setInvoiceProducts(products);
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
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
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
    const pajak = total * 0.11;
    const dppPercentage = (11 / 111) * 100;
    const dpp = (dppPercentage / 100) * total;
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
    const total = subTotal + (isShowDPP ? 0 : totalPajak);
    const balanceDue = total - dp;
    return {
      subTotal,
      totalDPP,
      diskon,
      totalPajak,
      total,
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
        tgl_po: formatDateForAPI(tglPO),
        no_do: noDO,
        tgl_kirim: formatDateForAPI(tglKirim),
        alamat: alamat,
        tgl_faktur: formatDateForAPI(tglFaktur),
        tgl_jatuh_tempo: formatDateForAPI(tglJatuhTempo),
        waktu_jatuh_tempo: waktuJatuhTempo,
        sub_total: totals.subTotal,
        dpp: totals.totalDPP,
        diskon: totals.diskon,
        ppn: totals.totalPajak,
        total: totals.total,
        dp: dp,
        balance_due: totals.balanceDue,
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
  const filteredProducts = invoiceProducts.filter(
    (product) =>
      product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.kode_produk.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit,
  );
  const totalPages = Math.ceil(filteredProducts.length / limit);
  const totals = calculateTotals();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Sales Invoice
          </h2>
          <button
            onClick={onClose}
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor PO
                    </label>
                    <input
                      type="text"
                      value={noPO}
                      onChange={(e) => setNoPO(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal PO
                    </label>
                    <input
                      type="date"
                      value={tglPO}
                      onChange={(e) => setTglPO(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor DO
                    </label>
                    <input
                      type="text"
                      value={noDO}
                      onChange={(e) => setNoDO(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Kirim
                    </label>
                    <input
                      type="date"
                      value={tglKirim}
                      onChange={(e) => setTglKirim(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Sales Invoice
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pelanggan
                    </label>
                    <input
                      type="text"
                      value={pelanggan}
                      onChange={(e) => setPelanggan(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Faktur
                    </label>
                    <input
                      type="date"
                      value={tglFaktur}
                      onChange={(e) => setTglFaktur(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Jatuh Tempo
                      </label>
                      <input
                        type="date"
                        value={tglJatuhTempo}
                        onChange={(e) => setTglJatuhTempo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu
                      </label>
                      <input
                        type="text"
                        value={waktuJatuhTempo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kode Barang
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nama Barang
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          QTY
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Harga
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          DPP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Diskon
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pajak
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No products available
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {(page - 1) * limit + index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.kode_produk}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                              {product.nama_produk}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatNumber(product.qty)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatNumber(product.harga)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatNumber(Math.round(product.dpp))}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={product.diskon_produk}
                                onChange={(e) =>
                                  handleDiskonProdukChange(
                                    (page - 1) * limit + index,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatNumber(Math.round(product.total))}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatNumber(Math.round(product.pajak))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-center">
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        color="primary"
                        page={page}
                        onChange={(e, i) => setPage(i)}
                        size="small"
                      />
                    </Stack>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes here..."
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    SubTotal
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatNumber(Math.round(totals.subTotal))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isShowDPP}
                      onChange={(e) => setIsShowDPP(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tampilkan DPP
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {formatNumber(Math.round(totals.totalDPP))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Diskon
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatNumber(Math.round(totals.diskon))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Diskon Retur
                  </span>
                  <input
                    type="number"
                    value={diskonRetur}
                    onChange={(e) =>
                      setDiskonRetur(parseFloat(e.target.value) || 0)
                    }
                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">PPn</span>
                  <span className="text-sm text-gray-900">
                    {formatNumber(Math.round(totals.totalPajak))}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatNumber(Math.round(totals.total))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">DP</span>
                  <input
                    type="number"
                    value={dp}
                    onChange={(e) => setDP(parseFloat(e.target.value) || 0)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-base font-semibold text-gray-900">
                    Balance Due
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatNumber(Math.round(totals.balanceDue))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || invoiceProducts.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateInvoiceModal;
