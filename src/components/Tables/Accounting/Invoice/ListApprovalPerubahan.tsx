import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import PerubahanDetailModal from './PerubahanDetailModal';

// ======================================
// INTERFACES
// ======================================

interface PerubahanInvoiceProduk {
  id: number;
  id_invoice_produk: number;
  id_perubahan_invoice: number;
  id_produk: number;
  nama_produk: string;
  qty: number;
  new_qty: number;
  harga: number;
  new_harga: number;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

interface PerubahanInvoiceItem {
  id: number;
  id_invoice: number;
  id_customer: number;

  nama_customer: string;
  alamat: string;
  new_alamat: string;

  tgl_faktur: string;
  new_tgl_faktur: string;

  no_invoice: string;
  no_perubahan_invoice: string;
  no_po: string;

  note: string;
  file: string;

  status: string;
  status_proses: string;

  tgl_pengajuan: string;
  tgl_invoice: string;

  createdAt: string;
  updatedAt: string;
  is_active: boolean;

  perubahan_invoice_produk: PerubahanInvoiceProduk[];

  user_create?: any;
  user_approve?: any;
  user_reject?: any;
}

interface PerubahanInvoiceResponse {
  data: PerubahanInvoiceItem[];
  success: boolean;
  status: number;
  total_page: number;
}

export interface PerubahanProduct {
  id_invoice_produk: number;
  id_produk: number;
  nama_produk: string;
  qty: number;
  harga: number;
  new_qty: number;
  new_harga: number;
}

export interface PerubahanFormData {
  id_invoice: number;
  id_customer: number;
  nama_customer: string;

  no_perubahan_invoice: string;
  no_po: string;
  no_invoice: string;

  tgl_invoice: string;
  alamat: string;
  tgl_faktur: string;

  new_alamat: string;
  new_tgl_faktur: string;

  note: string;
  file: string;

  perubahan_invoice_produk: PerubahanProduct[];
}

// ======================================
// COMPONENT
// ======================================

const ListApprovalPerubahan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<PerubahanInvoiceItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailFormData, setDetailFormData] =
    useState<PerubahanFormData | null>(null);

  // =============================
  // FETCH LIST
  // =============================

  useEffect(() => {
    fetchInvoiceData();
  }, [page, searchTerm, limit]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);

      const res: AxiosResponse<PerubahanInvoiceResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/perubahanInvoice`,
        {
          params: { page, limit, search: searchTerm, status: 'requested' },
          withCredentials: true,
        },
      );

      setInvoiceData(res.data.data || []);
      setTotalPages(res.data.total_page || 1);
    } catch (err) {
      console.error('Error fetching perubahan invoice list:', err);
      setInvoiceData([]);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // DETAIL HANDLER
  // =============================

  const handleDetail = async (item: PerubahanInvoiceItem) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/perubahanInvoice/${item.id}`,
        { withCredentials: true },
      );

      if (!res.data.success) {
        alert('Failed to load perubahan invoice detail.');
        return;
      }

      const detail: PerubahanInvoiceItem = res.data.data;

      const formData: PerubahanFormData = {
        id_invoice: detail.id_invoice,
        id_customer: detail.id_customer,
        nama_customer: detail.nama_customer,

        no_perubahan_invoice: detail.no_perubahan_invoice,
        no_po: detail.no_po,
        no_invoice: detail.no_invoice,

        tgl_invoice: detail.tgl_invoice,
        alamat: detail.alamat,
        tgl_faktur: detail.tgl_faktur,

        new_alamat: detail.new_alamat,
        new_tgl_faktur: detail.new_tgl_faktur,

        note: detail.note || '',
        file: detail.file || '',

        perubahan_invoice_produk: detail.perubahan_invoice_produk.map((p) => ({
          id_invoice_produk: p.id_invoice_produk,
          id_produk: p.id_produk,
          nama_produk: p.nama_produk,
          qty: p.qty,
          harga: p.harga,
          new_qty: p.new_qty,
          new_harga: p.new_harga,
        })),
      };

      setDetailFormData(formData);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching perubahan invoice detail:', err);
      alert('Failed to load perubahan invoice detail.');
    }
  };

  // =============================
  // APPROVE & REJECT HANDLERS
  // =============================

  const handleApprove = async (item: PerubahanInvoiceItem) => {
    if (!confirm('Are you sure you want to approve this perubahan invoice?')) {
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_LINK}/perubahanInvoice/approve/${item.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        alert('Perubahan invoice berhasil di-approve!');
        fetchInvoiceData();
      }
    } catch (err) {
      console.error('Error approving perubahan invoice:', err);
      alert('Gagal approve perubahan invoice.');
    }
  };

  const handleReject = async (item: PerubahanInvoiceItem) => {
    if (!confirm('Are you sure you want to reject this perubahan invoice?')) {
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_LINK}/perubahanInvoice/reject/${item.id}`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        alert('Perubahan invoice berhasil di-reject!');
        fetchInvoiceData();
      }
    } catch (err) {
      console.error('Error rejecting perubahan invoice:', err);
      alert('Gagal reject perubahan invoice.');
    }
  };

  // =============================
  // UTILITIES
  // =============================

  const formatDate = (d: string) => {
    if (!d) return '-';
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${dt.getFullYear()}`;
  };

  const truncate = (t: string, len: number) =>
    t?.length > len ? t.slice(0, len) + '...' : t;

  const getStatusBadge = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-200 text-gray-800',
      requested: 'bg-blue-200 text-blue-800',
      approved: 'bg-green-200 text-green-800',
      rejected: 'bg-red-200 text-red-800',
      done: 'bg-green-700 text-white',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search perubahan invoice..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded w-full"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">No Perubahan</th>
              <th className="px-3 py-2 text-left">No Invoice</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Tgl Faktur</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-5 text-center">
                  Loading...
                </td>
              </tr>
            ) : invoiceData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-5 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              invoiceData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="px-3 py-2">{item.no_perubahan_invoice}</td>
                  <td className="px-3 py-2">{item.no_invoice}</td>
                  <td className="px-3 py-2">
                    {truncate(item.nama_customer, 20)}
                  </td>
                  <td className="px-3 py-2">{formatDate(item.tgl_faktur)}</td>
                  <td className="px-3 py-2">{getStatusBadge(item.status)}</td>

                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDetail(item)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="View Details"
                      >
                        Detail
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        title="Approve"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(item)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Reject"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-3 py-1 text-xs rounded ${
                  limit === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, p) => setPage(p)}
            size="small"
            color="primary"
          />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {invoiceData.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded shadow border-b">
            11:28 PM
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-sm">
                  {item.no_perubahan_invoice}
                </div>
                <div className="text-xs text-gray-600">
                  {item.nama_customer}
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>
            <div className="mt-2 text-xs">
              <div>No Invoice: {item.no_invoice}</div>
              <div>Tgl Faktur: {formatDate(item.tgl_faktur)}</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleDetail(item)}
                className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded"
              >
                Detail
              </button>

              <button
                onClick={() => handleApprove(item)}
                className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded"
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(item)}
                className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && detailFormData && (
        <PerubahanDetailModal
          isOpen={isDetailModalOpen}
          formData={detailFormData}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
    </div>
  );
};
export default ListApprovalPerubahan;
