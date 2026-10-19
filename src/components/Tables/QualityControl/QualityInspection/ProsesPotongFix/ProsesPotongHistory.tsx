import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

interface PotongJob {
  id: number;
  mesin: string;
  no_jo: string;
  shift: string | number;
  bagian?: string | null;
  customer: string;
  createdAt: string;
  item: string;
  jenis_potong: string;
}

interface HistoryResponse {
  data?: PotongJob[];
  total_page?: number;
}

const API_URL = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPotong`;
const PAGE_LIMIT = 15;

const TABLE_HEADERS = [
  'Mesin',
  'No. JO',
  'Shift',
  'Bagian',
  'Customer',
  'Tanggal',
  'Item',
  'Jenis potong',
];

const getDetailPath = (job: PotongJob) => {
  if (job.jenis_potong === 'potong bahan')
    return `/qc/inspection/potong/bahan/${job.id}`;
  if (job.jenis_potong === 'potong jadi')
    return `/qc/inspection/potong/jadi/${job.id}`;
  return null;
};

const barColor = (jenis: string) =>
  jenis === 'potong bahan' ? 'border-green-500' : 'border-blue-500';

function JenisBadge({ jenis }: { jenis: string }) {
  const isBahan = jenis === 'potong bahan';
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        isBahan ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}
    >
      {jenis}
    </span>
  );
}

function ActionLink({
  path,
  className = '',
}: {
  path: string | null;
  className?: string;
}) {
  if (!path) return null;
  return (
    <Link
      to={path}
      className={`inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 ${className}`}
    >
      Lihat checksheet
    </Link>
  );
}

function JobList({ jobs }: { jobs: PotongJob[] }) {
  return (
    <>
      {/* Tabel (layar lebar) */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-neutral-500">
            <tr>
              {TABLE_HEADERS.map((h) => (
                <th key={h} scope="col" className="px-3 py-3 font-semibold">
                  {h}
                </th>
              ))}
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-blue-50">
                <td
                  className={`border-l-4 px-3 py-3 ${barColor(
                    job.jenis_potong,
                  )}`}
                >
                  {job.mesin}
                </td>
                <td className="px-3 py-3 font-medium">{job.no_jo}</td>
                <td className="px-3 py-3">{job.shift}</td>
                <td className="px-3 py-3">{job.bagian ?? '-'}</td>
                <td className="px-3 py-3">{job.customer}</td>
                <td className="px-3 py-3 text-xs">
                  {convertTimeStampToDate(job.createdAt)}
                </td>
                <td className="max-w-[220px] px-3 py-3 text-xs">
                  <span className="line-clamp-2">{job.item}</span>
                </td>
                <td className="px-3 py-3">
                  <JenisBadge jenis={job.jenis_potong} />
                </td>
                <td className="px-3 py-3 text-right">
                  <ActionLink path={getDetailPath(job)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kartu (mobile & tablet) */}
      <ul className="space-y-3 lg:hidden">
        {jobs.map((job) => (
          <li
            key={job.id}
            className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${barColor(
              job.jenis_potong,
            )}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-neutral-800">{job.no_jo}</p>
              <JenisBadge jenis={job.jenis_potong} />
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
              {job.item}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Mesin', job.mesin],
                ['Shift', job.shift],
                ['Bagian', job.bagian ?? '-'],
                ['Customer', job.customer],
                ['Tanggal', convertTimeStampToDate(job.createdAt)],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs text-neutral-500">{label}</dt>
                  <dd className="font-medium text-neutral-700">{value}</dd>
                </div>
              ))}
            </dl>
            <ActionLink path={getDetailPath(job)} className="mt-4 w-full" />
          </li>
        ))}
      </ul>
    </>
  );
}

function ProsesPotongHistory() {
  const [data, setData] = useState<HistoryResponse>();
  const [page, setPage] = useState(1);
  const [noJo, setNoJo] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await axios.get(API_URL, {
          params: { search: query, status: 'history', page, limit: PAGE_LIMIT },
          withCredentials: true,
        });
        if (!ignore) setData(res.data);
      } catch {
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [page, query, refresh]);

  const jobs = data?.data ?? [];
  const totalPage = data?.total_page ?? 1;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(noJo.trim());
    setRefresh((n) => n + 1);
  };

  const handleReset = () => {
    setNoJo('');
    setQuery('');
    setPage(1);
  };

  const messageCls =
    'rounded-xl bg-white px-4 py-10 text-center text-sm shadow-sm';

  return (
    <main className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="block flex-1 sm:max-w-xs">
          <span className="mb-1 block text-xs font-semibold text-blue-600">
            Nomor JO
          </span>
          <input
            type="search"
            value={noJo}
            onChange={(e) => setNoJo(e.target.value)}
            placeholder="Contoh: JO-00806/06/2026"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:flex-none"
          >
            Cari
          </button>
          {query && (
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 sm:flex-none"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {error ? (
        <div className={`${messageCls} text-red-600`}>
          <p>Data gagal dimuat. Periksa koneksi, lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => setRefresh((n) => n + 1)}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Muat ulang
          </button>
        </div>
      ) : loading ? (
        <div className={`${messageCls} text-neutral-400`}>Memuat data…</div>
      ) : jobs.length === 0 ? (
        <div className={`${messageCls} text-neutral-400`}>
          {query
            ? `Tidak ada riwayat untuk "${query}".`
            : 'Belum ada riwayat inspeksi.'}
        </div>
      ) : (
        <JobList jobs={jobs} />
      )}

      {totalPage > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            count={totalPage}
            page={page}
            color="primary"
            siblingCount={0}
            onChange={(_, p) => setPage(p)}
          />
        </div>
      )}
    </main>
  );
}

export default ProsesPotongHistory;
