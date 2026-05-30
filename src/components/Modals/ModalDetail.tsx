import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MasalahSparepart {
  nama_sparepart_baru: string | null;
  nama_sparepart_sebelumnya: string | null;
  grade_sparepart_baru: string | null;
  grade_sparepart_sebelumnya: string | null;
  lokasi_sparepart_baru: string | null;
  lokasi_sparepart_sebelumnya: string | null;
  use_qty: number | null;
  status: string | null;
  tgl_ganti: string | null;
}

interface ModalDetailProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  kendala: string;
  machineName: string;
  tgl: string;
  jam: string;
  namaPemeriksa: string;
  no: string;
  idTiket: number;
  kodeLkh: string;
  analisisPenyebab: string | null;
  kebutuhanSparepart: MasalahSparepart[] | null;
  tipeMaintenance: string | null;
  catatan: string | null;
  unit: string | null;
  bagian: string | null;
  file?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ModalDetail = ({
  children,
  isOpen,
  onClose,
  kendala,
  machineName,
  tgl,
  jam,
  namaPemeriksa,
  kodeLkh,
  analisisPenyebab,
  kebutuhanSparepart,
  tipeMaintenance,
  catatan,
  unit,
  bagian,
  file,
}: ModalDetailProps) => {
  if (!isOpen) return null;

  const [isMobile, setIsMobile] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [file]);

  const imageUrl = file
    ? `${import.meta.env.VITE_API_LINK}/images/${file}`
    : null;

  // ─── Status badge color ───
  const statusClass = (status: string | null) => {
    if (!status) return 'bg-slate-100 text-slate-500';
    if (status === 'done') return 'bg-emerald-100 text-emerald-700';
    return 'bg-amber-100 text-amber-700';
  };

  // ─── Photo ───
  const PhotoDisplay = () => {
    if (!imageUrl || imgError) {
      return (
        <div className="w-full h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="4"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <path
              d="M8 22l6-6 4 4 3-3 5 5"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="2" stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>
          <p className="text-xs text-slate-400">Tidak ada foto</p>
        </div>
      );
    }
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <img
          src={imageUrl}
          alt="Foto maintenance"
          className="w-full h-48 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  };

  // ─── Render ───
  return (
    <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 z-10 rounded-t-2xl">
          <div className="p-2 rounded-xl bg-slate-100">
            <svg width="18" height="18" viewBox="0 0 20 19" fill="none">
              <path
                d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z"
                stroke="#475569"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="flex-1 text-sm font-bold text-slate-800">
            Detail Proses Maintenance
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="11" fill="#0065DE" />
              <rect
                x="6.03955"
                y="4.23242"
                width="17"
                height="3"
                rx="1.5"
                transform="rotate(42.8321 6.03955 4.23242)"
                fill="white"
              />
              <rect
                x="4.18213"
                y="16.0609"
                width="17"
                height="3"
                rx="1.5"
                transform="rotate(-45 4.18213 16.0609)"
                fill="white"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Info Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Nama Mesin
              </p>
              <p className="text-base font-semibold text-slate-800">
                {machineName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Kendala
              </p>
              <p className="text-sm text-slate-700">
                {kodeLkh} — {kendala}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Nama Pemeriksa
              </p>
              <p className="text-sm text-slate-700">{namaPemeriksa}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Tanggal Pemeriksaan
              </p>
              <p className="text-sm text-slate-700">{tgl}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Jam Pemeriksaan
              </p>
              <p className="text-sm text-slate-700">{jam}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Unit
                </p>
                <p className="text-sm text-slate-700">{unit ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Bagian
                </p>
                <p className="text-sm text-slate-700">{bagian ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Kode MTC + Foto ── */}
          <div
            className={`grid gap-4 ${
              !isMobile ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Kode MTC
              </p>
              <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[44px]">
                {analisisPenyebab || '—'}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Foto
              </p>
              <PhotoDisplay />
            </div>
          </div>

          {/* ── Tipe Maintenance ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Tipe Maintenance
              </p>
              <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                {tipeMaintenance || '—'}
              </div>
            </div>
          </div>

          {/* ── Kebutuhan Sparepart ── */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Kebutuhan Sparepart
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    {[
                      'No',
                      'Sparepart Baru',
                      'Sparepart Rusak',
                      'Grade Baru',
                      'Grade Rusak',
                      'Lokasi Baru',
                      'Lokasi Rusak',
                      'Qty',
                      'Status',
                      'Tanggal',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kebutuhanSparepart && kebutuhanSparepart.length > 0 ? (
                    kebutuhanSparepart.map((item, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                      >
                        <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {item.nama_sparepart_baru ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {item.nama_sparepart_sebelumnya ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          {item.grade_sparepart_baru ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {item.grade_sparepart_baru}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {item.grade_sparepart_sebelumnya ? (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {item.grade_sparepart_sebelumnya}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {item.lokasi_sparepart_baru ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {item.lokasi_sparepart_sebelumnya ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-700 font-medium">
                          {item.use_qty ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(
                              item.status,
                            )}`}
                          >
                            {item.status ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                          {item.tgl_ganti
                            ? new Date(item.tgl_ganti).toLocaleDateString(
                                'id-ID',
                              )
                            : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        Tidak ada data sparepart
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Analisis ── */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Analisis Penyebab & Detail Tindakan
            </p>
            <textarea
              value={catatan ?? ''}
              readOnly
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none"
            />
          </div>

          {/* ── Close ── */}
          <button
            onClick={onClose}
            className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ModalDetail;
