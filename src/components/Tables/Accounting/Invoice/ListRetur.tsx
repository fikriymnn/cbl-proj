import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Stack } from '@mui/material';
import DetailInvoiceModal from './DetailIReturModal';

interface InvoiceItem {
  id: number;
  no_invoice: string;
  no_do: string;
  no_po: string;
  no_retur: string;
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
  id_create: number;
  id_approve: number | null;
  id_reject: number | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: InvoiceItem[];
  status: number;
  success: boolean;
  total_page: number;
}

const ListRetur: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res: AxiosResponse<ApiResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/retur`,
        {
          params: { page, limit, search },
          withCredentials: true,
        },
      );

      setInvoiceData(res.data.data);
      setTotalPages(res.data.total_page || 1);
    } catch (e) {
      console.error('ERROR loading retur:', e);
      setInvoiceData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '-';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const getStatusBadge = (status: string) => {
    const colors: any = {
      done: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || 'bg-gray-200 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <input
          className="border px-3 py-2 rounded-lg text-sm w-full"
          placeholder="Search Invoice, DO, PO, Customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                No Retur
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                No Invoice
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                No DO
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                Customer
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                Tgl Faktur
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                Total
              </th>
              <th className="px-3 py-2 text-xs font-mediumtext-center">
                Status
              </th>
              <th className="px-3 py-2 text-xs font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : invoiceData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No Data
                </td>
              </tr>
            ) : (
              invoiceData.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs">{d.no_retur}</td>
                  <td className="px-3 py-2 text-xs">{d.no_invoice}</td>
                  <td className="px-3 py-2 text-xs">{d.no_do}</td>
                  <td className="px-3 py-2 text-xs">{d.nama_customer}</td>
                  <td className="px-3 py-2 text-xs">
                    {formatDate(d.tgl_faktur)}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold">
                    {formatCurrency(d.total)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {getStatusBadge(d.status)}
                  </td>

                  <td className="px-3 py-2 text-xs text-center">
                    <button
                      onClick={() => {
                        setSelectedId(d.id);
                        setDetailOpen(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4">
          <div className="flex gap-2">
            {[10, 25, 50].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setLimit(v);
                  setPage(1);
                }}
                className={`px-2 py-1 text-xs rounded ${
                  limit === v ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            size="small"
          />
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedId && (
        <DetailInvoiceModal
          invoiceId={selectedId}
          isOpen={isDetailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default ListRetur;
