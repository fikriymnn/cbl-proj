import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface InvoiceProduk {
  id: number;
  id_invoice: number;
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  qty: number;
  unit: string;
  harga: number;
  diskon_produk: number;
  dpp: number;
  pajak: number;
  total: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReturProduk {
  id: number;
  id_retur: number;
  id_produk: number;
  kode_produk: string;
  nama_produk: string;
  qty: number;
  qty_produk: number;
  unit: string;
  harga: number;
  dpp: number;
  pajak: number;
  total: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Retur {
  id: number;
  no_retur: string;
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
  total: number;
  note: string;
  status: string;
  status_proses: string;
  id_customer: number;
  id_invoice: number;
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  is_active: boolean;
  retur_produk: ReturProduk[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  uuid: string;
  nama: string;
  email: string;
  role: string;
  bagian: string;
  status: string;
  id_karyawan: number;
  no: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceDetail {
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
  sub_total: number;
  diskon: number;
  dpp: number;
  ppn: number;
  total: number;
  dp: number;
  balance_due: number | null;
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
  invoice_produk: InvoiceProduk[];
  retur: Retur[];
  user_create: User;
  user_approve: User | null;
  user_reject: User | null;
  createdAt: string;
  updatedAt: string;
}

interface DetailInvoiceModalProps {
  invoiceId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DetailInvoiceModal: React.FC<DetailInvoiceModalProps> = ({
  invoiceId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetail | null>(
    null,
  );

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceDetail();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceDetail = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/retur/${invoiceId}`;

    try {
      setLoading(true);

      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log('Invoice detail:', res.data);

      if (res.data.success && res.data.data) {
        setInvoiceDetail(res.data.data);
      } else {
        setInvoiceDetail(null);
      }
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      setInvoiceDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      done: 'bg-blue-100 text-blue-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'belum lunas': 'bg-red-100 text-red-800',
      lunas: 'bg-green-100 text-green-800',
      'sebagian lunas': 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice Detail
            </h3>
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
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : invoiceDetail ? (
              <div className="space-y-6">
                {/* Invoice Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Invoice Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        No Invoice:
                      </span>
                      <div className="text-sm text-gray-900 font-semibold">
                        {invoiceDetail.no_invoice}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        No DO:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceDetail.no_do}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        No PO:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceDetail.no_po}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        Status:
                      </span>
                      <div className="mt-1">
                        {getStatusBadge(invoiceDetail.status)}
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
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        Customer Name:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceDetail.nama_customer}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 font-medium">
                        Address:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceDetail.alamat}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Date Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 font-medium">
                        Tanggal Faktur:
                      </span>
                      <div className="text-sm text-gray-900">
                        {formatDate(invoiceDetail.tgl_faktur)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 font-medium">
                        Tanggal PO:
                      </span>
                      <div className="text-sm text-gray-900">
                        {formatDate(invoiceDetail.tgl_po)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 font-medium">
                        Tanggal Kirim:
                      </span>
                      <div className="text-sm text-gray-900">
                        {formatDate(invoiceDetail.tgl_kirim)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 font-medium">
                        Tanggal Jatuh Tempo:
                      </span>
                      <div className="text-sm text-gray-900">
                        {formatDate(invoiceDetail.tgl_jatuh_tempo)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                      <span className="text-xs text-gray-600 font-medium">
                        Waktu Jatuh Tempo:
                      </span>
                      <div className="text-sm text-gray-900">
                        {invoiceDetail.waktu_jatuh_tempo}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Products */}
                {invoiceDetail.invoice_produk &&
                  invoiceDetail.invoice_produk.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Invoice Products
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Kode
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Nama Produk
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Qty
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Unit
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Harga
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Diskon
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  DPP
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Pajak
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {invoiceDetail.invoice_produk.map((product) => (
                                <tr
                                  key={product.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-xs text-gray-900">
                                    {product.kode_produk}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900">
                                    {product.nama_produk}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right">
                                    {product.qty.toLocaleString('id-ID')}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900">
                                    {product.unit}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right">
                                    {formatCurrency(product.harga)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-red-600 text-right">
                                    {formatCurrency(product.diskon_produk)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right">
                                    {formatCurrency(product.dpp)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right">
                                    {formatCurrency(product.pajak)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right font-semibold">
                                    {formatCurrency(product.total)}
                                  </td>
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
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-gray-700 font-medium">
                        Sub Total:
                      </span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {formatCurrency(invoiceDetail.sub_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-gray-700 font-medium">
                        Diskon:
                      </span>
                      <span className="text-sm text-red-600 font-semibold">
                        - {formatCurrency(invoiceDetail.diskon)}
                      </span>
                    </div>
                    {invoiceDetail.is_show_dpp && (
                      <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                        <span className="text-sm text-gray-700 font-medium">
                          DPP:
                        </span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(invoiceDetail.dpp)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-gray-700 font-medium">
                        PPN:
                      </span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {formatCurrency(invoiceDetail.ppn)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-gray-700 font-medium">
                        DP:
                      </span>
                      <span className="text-sm text-green-600 font-semibold">
                        - {formatCurrency(invoiceDetail.dp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 bg-white rounded-lg p-3">
                      <span className="text-base text-gray-900 font-bold">
                        Total:
                      </span>
                      <span className="text-lg text-blue-600 font-bold">
                        {formatCurrency(invoiceDetail.total)}
                      </span>
                    </div>
                    {invoiceDetail.balance_due !== null && (
                      <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <span className="text-sm text-gray-900 font-semibold">
                          Balance Due:
                        </span>
                        <span className="text-base text-yellow-700 font-bold">
                          {formatCurrency(invoiceDetail.balance_due)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Returns */}
                {invoiceDetail.retur && invoiceDetail.retur.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Returns (Retur)
                    </h4>
                    <div className="space-y-4">
                      {invoiceDetail.retur.map((retur) => (
                        <div
                          key={retur.id}
                          className="bg-red-50 rounded-lg border border-red-200 p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {retur.no_retur}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {formatDate(retur.tgl_faktur)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(retur.status)}
                              {getStatusBadge(retur.status_proses)}
                            </div>
                          </div>

                          {retur.retur_produk &&
                            retur.retur_produk.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                  Returned Products:
                                </div>
                                <div className="bg-white rounded border border-red-100 overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                          Kode
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                          Produk
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                          Qty
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {retur.retur_produk.map((produk) => (
                                        <tr
                                          key={produk.id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-3 py-2 text-xs text-gray-900">
                                            {produk.kode_produk}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-900">
                                            {produk.nama_produk}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-900 text-right">
                                            {produk.qty.toLocaleString('id-ID')}{' '}
                                            {produk.unit}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-900 text-right font-semibold">
                                            {formatCurrency(produk.total)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          <div className="mt-3 pt-3 border-t border-red-200 flex justify-between items-center">
                            <span className="text-xs text-gray-700 font-medium">
                              Total Retur:
                            </span>
                            <span className="text-sm text-red-700 font-bold">
                              {formatCurrency(retur.total)}
                            </span>
                          </div>

                          {retur.note && (
                            <div className="mt-2 text-xs text-gray-600 italic">
                              Note: {retur.note}
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
                      {getPaymentStatusBadge(invoiceDetail.status_payment)}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-700 font-medium">
                        Status Proses:
                      </span>
                      {getStatusBadge(invoiceDetail.status_proses)}
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    User Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-gray-600 font-medium mb-2">
                        Created By:
                      </div>
                      <div className="text-sm text-gray-900 font-semibold">
                        {invoiceDetail.user_create.nama}
                      </div>
                      <div className="text-xs text-gray-600">
                        {invoiceDetail.user_create.role}
                      </div>
                      <div className="text-xs text-gray-500">
                        {invoiceDetail.user_create.email}
                      </div>
                    </div>

                    {invoiceDetail.user_approve && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 font-medium mb-2">
                          Approved By:
                        </div>
                        <div className="text-sm text-gray-900 font-semibold">
                          {invoiceDetail.user_approve.nama}
                        </div>
                        <div className="text-xs text-gray-600">
                          {invoiceDetail.user_approve.role}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoiceDetail.user_approve.email}
                        </div>
                      </div>
                    )}

                    {invoiceDetail.user_reject && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="text-xs text-gray-600 font-medium mb-2">
                          Rejected By:
                        </div>
                        <div className="text-sm text-gray-900 font-semibold">
                          {invoiceDetail.user_reject.nama}
                        </div>
                        <div className="text-xs text-gray-600">
                          {invoiceDetail.user_reject.role}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoiceDetail.user_reject.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {invoiceDetail.note && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Notes
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm text-gray-900">
                        {invoiceDetail.note}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Created At:</span>{' '}
                      {formatDate(invoiceDetail.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Updated At:</span>{' '}
                      {formatDate(invoiceDetail.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No invoice detail found</p>
              </div>
            )}
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
export default DetailInvoiceModal;
