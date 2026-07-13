import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Loading from '../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KodeAnalisis {
  kode_analisis: string;
  nama_analisis: string;
  bagian_analisis: string;
}

interface SkorPerbaikan {
  skor: number;
  nama_skor: string;
}

interface MasterMesin {
  id: number;
  nama_mesin: string;
}

interface SparepartStok {
  id: number;
  kode: string;
  part_number: string;
  nama_sparepart: string;
  nama_mesin: string;
  lokasi: string;
  umur_sparepart: number | null;
  grade: string;
  stok: number;
}

interface MasterSparepart {
  id: number;
  kode: string;
  nama_sparepart: string;
  nama_mesin: string;
  posisi_part: string;
  sisa_umur: number | null;
  grade_2: string;
}

interface SparepartEntry {
  id_stok: number | null;
  detail_stok: {
    kode: string;
    part_number: string;
    nama_sparepart: string;
    nama_mesin: string;
    lokasi: string;
    umur: number | null;
    grade: string;
  };
  id_ms_sparepart: number | null;
  detail_ms_sparepart: {
    kode: string;
    nama_sparepart: string;
    nama_mesin: string;
    posisi_part: string;
    sisa_umur: number | null;
    grade: string;
  };
}

interface ProsesMtcInitial {
  id: number;
  kode_analisis_mtc: string | null;
  nama_analisis_mtc: string | null;
  jenis_analisis_mtc?: string | null;
  note_mtc: string | null;
  note_tindakan: string | null; // ← add this
  note_analisis: string | null; // ← add this
  skor_mtc: number;
  cara_perbaikan: string | null;
  unit: string | null;
  bagian_mesin: string | null;
  file: string | null;
}
interface ModalStockCheck1Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  kendala: string;
  machineName: string;
  tgl: string | null;
  jam: string;
  namaPemeriksa: string | undefined;
  no: string;
  idTiket: number;
  idProses: number | undefined;
  kodeLkh: string;
  namaMesin: string;
  skor_mtc: number | undefined;
  jenis_perbaikan: string | null | undefined;
  unit: string | null | undefined;
  bagian: string | null | undefined;
  // Edit mode
  isEditMode?: boolean;
  editInitialData?: ProsesMtcInitial;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(datetime: string | null): string {
  if (!datetime) return '-';
  const d = new Date(datetime);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

function formatTime(datetime: string | null): string {
  if (!datetime) return '-';
  const d = new Date(datetime);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ModalStockCheck1 = ({
  children,
  isOpen,
  onClose,
  onFinish,
  kendala,
  machineName,
  tgl,
  jam,
  namaPemeriksa,
  no,
  idTiket,
  idProses,
  kodeLkh,
  namaMesin,
  skor_mtc,
  jenis_perbaikan,
  unit,
  bagian,
  isEditMode = false,
  editInitialData,
}: ModalStockCheck1Props) => {
  if (!isOpen) return null;

  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form data
  const [typePost, setTypePost] = useState<'normal' | 'pending'>('normal');
  const [masterMesin, setMasterMesin] = useState<MasterMesin[]>([]);
  const [kodeAnalisisList, setKodeAnalisisList] = useState<KodeAnalisis[]>([]);
  const [skorPerbaikanList, setSkorPerbaikanList] = useState<SkorPerbaikan[]>(
    [],
  );
  const [selectedKodeAnalisis, setSelectedKodeAnalisis] =
    useState<KodeAnalisis | null>(null);
  const [selectedSkorPerbaikan, setSelectedSkorPerbaikan] =
    useState<SkorPerbaikan | null>(null);
  const [noteMaintenance, setNoteMaintenance] = useState<string>('');
  const [noteTindakan, setNoteTindakan] = useState<string>(''); // ← add this
  const [unitMaintenance, setUnitMaintenance] = useState<string>('');
  const [bagianMaintenance, setBagianMaintenance] = useState<string>('');
  const [alasanPending, setAlasanPending] = useState<string>('');
  const [kebutuhanSparepart, setKebutuhanSparepart] = useState<
    SparepartEntry[]
  >([]);

  // Sparepart modals
  const [showModalStok, setShowModalStok] = useState(false);
  const [showModalMsStok, setShowModalMsStok] = useState(false);
  const [activeSparepartIndex, setActiveSparepartIndex] = useState<number>(0);
  const [stokSparepart, setStokSparepart] = useState<SparepartStok[]>([]);
  const [displayedStokSparepart, setDisplayedStokSparepart] = useState<
    SparepartStok[]
  >([]);
  const [masterSparepart, setMasterSparepart] = useState<MasterSparepart[]>([]);
  const [displayedMasterSparepart, setDisplayedMasterSparepart] = useState<
    MasterSparepart[]
  >([]);

  // Info tooltips
  const [info, setInfo] = useState<Record<number, boolean>>({});
  const [infoPengganti, setInfoPengganti] = useState<Record<number, boolean>>(
    {},
  );

  // ─── Init ───
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    getKodeAnalisis();
    getSkorPerbaikan();
    getMasterMesin();

    // Pre-fill in edit mode
    if (isEditMode && editInitialData) {
      setNoteMaintenance(editInitialData.note_mtc ?? '');
      setNoteTindakan(editInitialData.note_tindakan ?? ''); // ← add this
      setUnitMaintenance(editInitialData.unit ?? '');
      setBagianMaintenance(editInitialData.bagian_mesin ?? '');
    }
  }, []);

  // ─── API ───
  async function getKodeAnalisis() {
    try {
      const res = await axios.get<KodeAnalisis[]>(
        `${import.meta.env.VITE_API_LINK}/master/kodeAnalisis`,
        { withCredentials: true },
      );
      setKodeAnalisisList(res.data);

      if (isEditMode && editInitialData?.kode_analisis_mtc) {
        const found = res.data.find(
          (k) => k.kode_analisis === editInitialData.kode_analisis_mtc,
        );
        if (found) setSelectedKodeAnalisis(found);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function getSkorPerbaikan() {
    try {
      const res = await axios.get<SkorPerbaikan[]>(
        `${import.meta.env.VITE_API_LINK}/master/skorMtc`,
        { withCredentials: true },
      );
      setSkorPerbaikanList(res.data);

      if (isEditMode && editInitialData?.cara_perbaikan) {
        const found = res.data.find(
          (s) => s.nama_skor === editInitialData.cara_perbaikan,
        );
        if (found) setSelectedSkorPerbaikan(found);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function getMasterMesin() {
    try {
      const res = await axios.get<MasterMesin[]>(
        `${import.meta.env.VITE_API_LINK}/master/mesin`,
        { withCredentials: true },
      );
      setMasterMesin(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function getStokSparepart(idMesin: string) {
    try {
      const res = await axios.get<SparepartStok[]>(
        `${import.meta.env.VITE_API_LINK}/stokSparepart`,
        { params: { id_mesin: idMesin }, withCredentials: true },
      );
      setStokSparepart(res.data);
      setDisplayedStokSparepart(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function getMasterSparepart(idMesin: string) {
    try {
      const res = await axios.get<MasterSparepart[]>(
        `${import.meta.env.VITE_API_LINK}/master/sparepart`,
        { params: { id_mesin: idMesin }, withCredentials: true },
      );
      setMasterSparepart(res.data);
      setDisplayedMasterSparepart(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  // ─── File upload ───
  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<{
      fileName?: string;
      filename?: string;
      file?: string;
    }>(`${import.meta.env.VITE_API_LINK}/images`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.fileName ?? res.data.filename ?? res.data.file ?? '';
  }

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2 MB');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    ['modal-file-upload', 'modal-file-upload-mobile'].forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
  };

  // ─── Submit ───
  async function postAnalisis() {
    if (!noteMaintenance.trim()) {
      alert('Catatan wajib diisi');
      return;
    }
    if (!noteTindakan.trim()) {
      // ← add this if required
      alert('Note tindakan wajib diisi');
      return;
    }
    if (!unitMaintenance.trim()) {
      alert('Unit wajib diisi');
      return;
    }

    try {
      setIsLoading(true);
      let uploadedFileName: string | null = null;
      if (selectedFile) uploadedFileName = await handleFileUpload(selectedFile);

      if (isEditMode) {
        // Edit mode — PUT /ticket/updateAnalisis/:id
        await axios.put(
          `${import.meta.env.VITE_API_LINK}/ticket/updateAnalisis/${idTiket}`,
          {
            id_proses: idProses,
            kode_analisis_mtc: selectedKodeAnalisis?.kode_analisis,
            nama_analisis_mtc: selectedKodeAnalisis?.nama_analisis,
            jenis_analisis_mtc: selectedKodeAnalisis?.bagian_analisis,
            note_analisis: '',
            skor_mtc: selectedSkorPerbaikan?.skor,
            cara_perbaikan: selectedSkorPerbaikan?.nama_skor,
            note_mtc: noteMaintenance,
            note_tindakan: noteTindakan,
            nama_mesin: namaMesin,
            unit: unitMaintenance,
            bagian_mesin: bagianMaintenance,
            file: uploadedFileName ?? editInitialData?.file,
          },
          { withCredentials: true },
        );
      } else if (typePost === 'normal') {
        await axios.put(
          `${import.meta.env.VITE_API_LINK}/ticket/analisis/${idTiket}`,
          {
            id_proses: idProses,
            kode_analisis_mtc: selectedKodeAnalisis?.kode_analisis,
            nama_analisis_mtc: selectedKodeAnalisis?.nama_analisis,
            jenis_analisis_mtc: selectedKodeAnalisis?.bagian_analisis,
            note_analisis: '',
            masalah_sparepart: kebutuhanSparepart,
            skor_mtc: selectedSkorPerbaikan?.skor,
            cara_perbaikan: selectedSkorPerbaikan?.nama_skor,
            note_mtc: noteMaintenance,
            note_tindakan: noteTindakan, // ← add this
            unit: unitMaintenance,
            bagian_mesin: bagianMaintenance,
            nama_mesin: namaMesin,
            file: uploadedFileName,
          },
          { withCredentials: true },
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_LINK}/ticket/pending/${idTiket}`,
          {
            id_proses: idProses,
            note_mtc: noteMaintenance,
            alasan_pending: alasanPending,

            file: uploadedFileName,
          },
          { withCredentials: true },
        );
      }

      onClose();
      onFinish();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteExit(idTicket: number, idProses: number) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/ticket/delete/${idTicket}`,
        { id_proses: idProses },
        { withCredentials: true },
      );
      onFinish();
    } catch (err) {
      console.error(err);
    }
  }

  // ─── Sparepart helpers ───
  const handleAddSparepart = () => {
    setKebutuhanSparepart((prev) => [
      ...prev,
      {
        id_stok: null,
        detail_stok: {
          kode: '',
          part_number: '',
          nama_sparepart: '',
          nama_mesin: '',
          lokasi: '',
          umur: null,
          grade: '',
        },
        id_ms_sparepart: null,
        detail_ms_sparepart: {
          kode: '',
          nama_sparepart: '',
          nama_mesin: '',
          posisi_part: '',
          sisa_umur: null,
          grade: '',
        },
      },
    ]);
  };

  const handleDeleteSparepart = (i: number) => {
    setKebutuhanSparepart((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSearch = (
    term: string,
    type: 'masterSparepart' | 'stokSparepart',
  ) => {
    const q = term.toLowerCase();
    if (type === 'masterSparepart') {
      setDisplayedMasterSparepart(
        !term
          ? masterSparepart
          : masterSparepart.filter(
              (it) =>
                it.nama_sparepart?.toLowerCase().includes(q) ||
                it.kode?.toLowerCase().includes(q) ||
                it.posisi_part?.toLowerCase().includes(q),
            ),
      );
    } else {
      setDisplayedStokSparepart(
        !term
          ? stokSparepart
          : stokSparepart.filter(
              (it) =>
                it.nama_sparepart?.toLowerCase().includes(q) ||
                it.kode?.toLowerCase().includes(q),
            ),
      );
    }
  };

  // ─── Upload Zone ───
  const UploadZone = ({ id }: { id: string }) => (
    <div
      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
        dragActive
          ? 'border-blue-400 bg-blue-50'
          : selectedFile
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0])
          validateAndSetFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        type="file"
        id={id}
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {selectedFile ? (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8l4 4 6-6"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M5 5l3-3 3 3M3 12h10"
                stroke="#6b7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-blue-600">Klik</span> atau drag
            & drop
          </p>
          <p className="text-xs text-slate-400">PNG, JPG hingga 2MB</p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  const modalTitle = isEditMode
    ? 'Edit Analisis Maintenance'
    : 'Form Respon Maintenance';
  const tanggalPeriksa = formatDateTime(tgl);
  const waktuPeriksa = formatTime(tgl);

  return (
    <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        {isLoading && <Loading />}

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 z-10 rounded-t-2xl">
          <div
            className={`p-2 rounded-xl ${
              isEditMode ? 'bg-amber-100' : 'bg-blue-100'
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z"
                stroke={isEditMode ? '#d97706' : '#0065DE'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-800">{modalTitle}</h2>
            {isEditMode && (
              <p className="text-xs text-amber-600">
                Mode Edit — mengubah data proses yang sudah ada
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (
                !isEditMode &&
                skor_mtc !== 0 &&
                jenis_perbaikan == null &&
                idProses
              )
                deleteExit(idTiket, idProses);
              onClose();
            }}
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

        <div className="px-6 py-4 space-y-5">
          {/* ── Info Grid ── */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                Nama Mesin
              </p>
              <p className="text-base font-semibold text-slate-800">
                {machineName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                Tanggal Pemeriksaan
              </p>
              <p className="text-base font-semibold text-slate-800">
                {tanggalPeriksa}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                Kendala
              </p>
              <p className="text-sm text-slate-700">
                {kodeLkh} — {kendala}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                Jam Pemeriksaan
              </p>
              <p className="text-base font-semibold text-slate-800">
                {waktuPeriksa}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                Nama Pemeriksa
              </p>
              <p className="text-sm text-slate-700">{namaPemeriksa ?? '-'}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                  Unit
                </p>
                <p className="text-sm text-slate-700">{unit ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                  Bagian
                </p>
                <p className="text-sm text-slate-700">{bagian ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* ── Kode MTC + Upload ── */}
          <div
            className={`grid gap-4 ${
              !isMobile ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kode MTC
              </label>
              <select
                value={selectedKodeAnalisis?.kode_analisis ?? ''}
                onChange={(e) => {
                  const found = kodeAnalisisList.find(
                    (k) => k.kode_analisis === e.target.value,
                  );
                  setSelectedKodeAnalisis(found ?? null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
              >
                <option value="" disabled>
                  Pilih kode penyebab...
                </option>
                {kodeAnalisisList.map((k) => (
                  <option key={k.kode_analisis} value={k.kode_analisis}>
                    {k.kode_analisis} — {k.nama_analisis}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Upload Foto
              </label>
              <UploadZone
                id={isMobile ? 'modal-file-upload-mobile' : 'modal-file-upload'}
              />
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain bg-slate-50"
              />
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* ── Unit + Bagian ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={unitMaintenance}
                onChange={(e) => setUnitMaintenance(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                placeholder="Masukkan unit..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Bagian Mesin
              </label>
              <input
                type="text"
                value={bagianMaintenance}
                onChange={(e) => setBagianMaintenance(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
                placeholder="Masukkan bagian mesin..."
              />
            </div>
          </div>

          {/* ── Sparepart (create mode only) ── */}
          {!isEditMode && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Kebutuhan Sparepart
                </label>
                <button
                  onClick={handleAddSparepart}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Tambah
                </button>
              </div>

              <div className="space-y-2">
                {kebutuhanSparepart.map((sp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <span className="text-xs font-bold text-blue-600 w-5">
                      {i + 1}
                    </span>

                    {/* Sparepart rusak */}
                    <button
                      onClick={() => {
                        setActiveSparepartIndex(i);
                        setShowModalMsStok(true);
                      }}
                      className={`flex-1 text-xs font-semibold h-9 px-3 rounded-lg transition-colors ${
                        sp.id_ms_sparepart
                          ? 'bg-white border border-blue-200 text-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {sp.id_ms_sparepart
                        ? sp.detail_ms_sparepart.nama_sparepart
                        : 'Pilih Sparepart Rusak'}
                    </button>

                    <button
                      onClick={() => setInfo((p) => ({ ...p, [i]: !p[i] }))}
                      className="p-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Info"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="white"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <path
                          d="M6 5.5v3M6 4h.01"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-slate-400 flex-shrink-0"
                    >
                      <path
                        d="M2 8h12M8 2v12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Sparepart pengganti */}
                    <button
                      onClick={() => {
                        setActiveSparepartIndex(i);
                        setShowModalStok(true);
                      }}
                      className={`flex-1 text-xs font-semibold h-9 px-3 rounded-lg transition-colors ${
                        sp.id_stok
                          ? 'bg-white border border-blue-200 text-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {sp.id_stok
                        ? sp.detail_stok.nama_sparepart
                        : 'Pilih Pengganti'}
                    </button>

                    <button
                      onClick={() =>
                        setInfoPengganti((p) => ({ ...p, [i]: !p[i] }))
                      }
                      className="p-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Info"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="white"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <path
                          d="M6 5.5v3M6 4h.01"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    {/* Grade */}
                    <div className="text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg px-2 h-9 flex items-center min-w-10">
                      {sp.detail_stok.grade || '—'}
                    </div>

                    <button
                      onClick={() => handleDeleteSparepart(i)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    {/* Info tooltips */}
                    {info[i] && (
                      <div className="absolute z-20 mt-2 w-52 bg-white border border-blue-200 rounded-xl shadow-lg p-3 text-xs">
                        <p className="font-bold text-blue-700 mb-1">
                          Sparepart Rusak
                        </p>
                        <p>
                          <span className="text-slate-500">Umur:</span>{' '}
                          {sp.detail_ms_sparepart.sisa_umur ?? '-'}
                        </p>
                        <p>
                          <span className="text-slate-500">Grade:</span>{' '}
                          {sp.detail_ms_sparepart.grade || '-'}
                        </p>
                      </div>
                    )}
                    {infoPengganti[i] && (
                      <div className="absolute z-20 mt-2 w-52 bg-white border border-blue-200 rounded-xl shadow-lg p-3 text-xs">
                        <p className="font-bold text-blue-700 mb-1">
                          Sparepart Pengganti
                        </p>
                        <p>
                          <span className="text-slate-500">Umur:</span>{' '}
                          {sp.detail_stok.umur ?? '-'}
                        </p>
                        <p>
                          <span className="text-slate-500">Grade:</span>{' '}
                          {sp.detail_stok.grade || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tipe Maintenance ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Tipe Maintenance
            </label>
            <select
              value={
                isEditMode
                  ? selectedSkorPerbaikan?.nama_skor ?? ''
                  : typePost === 'pending'
                  ? 'pending'
                  : selectedSkorPerbaikan?.nama_skor ?? ''
              }
              onChange={(e) => {
                if (e.target.value === 'pending') {
                  setTypePost('pending');
                  setSelectedSkorPerbaikan(null);
                } else {
                  const found = skorPerbaikanList.find(
                    (s) => s.nama_skor === e.target.value,
                  );
                  setSelectedSkorPerbaikan(found ?? null);
                  setTypePost('normal');
                }
              }}
              className="w-full md:w-96 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition"
            >
              <option value="">Pilih tipe...</option>
              {skorPerbaikanList.map((s) => (
                <option key={s.nama_skor} value={s.nama_skor}>
                  {s.skor}% — {s.nama_skor}
                </option>
              ))}
              {!isEditMode && <option value="pending">0% — Pending</option>}
            </select>
          </div>

          {/* ── Pending reason ── */}
          {!isEditMode && typePost === 'pending' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">
                Alasan Pending
              </p>
              <div className="flex gap-6">
                {['man', 'sparepart', 'time'].map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="alasan"
                      value={val}
                      onChange={(e) => setAlasanPending(e.target.value)}
                      className="accent-amber-500"
                    />
                    <span className="text-sm capitalize text-slate-700">
                      {val}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* ── Analisis ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Analisis Penyebab <span className="text-red-500">*</span>
            </label>
            <textarea
              value={noteMaintenance}
              onChange={(e) => setNoteMaintenance(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition resize-none"
              placeholder="Jelaskan analisis penyebab dan tindakan yang dilakukan..."
            />
          </div>

          {/* ── Note Tindakan ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Detail Tindakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={noteTindakan}
              onChange={(e) => setNoteTindakan(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition resize-none"
              placeholder="Catatan tindakan tambahan..."
            />
          </div>

          {/* ── Submit ── */}
          <button
            disabled={isLoading}
            onClick={postAnalisis}
            className={`w-full h-12 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 ${
              isEditMode
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading
              ? 'Menyimpan...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Simpan'}
          </button>
        </div>

        {/* ── Sparepart Rusak Modal ── */}
        {showModalMsStok && (
          <SparepartModal
            title="Pilih Sparepart Rusak"
            masterMesin={masterMesin}
            data={displayedMasterSparepart}
            columns={['Kode', 'Sparepart', 'Posisi Part']}
            onMesinChange={(id) => getMasterSparepart(id)}
            onSearch={(q) => handleSearch(q, 'masterSparepart')}
            onClose={() => setShowModalMsStok(false)}
            renderRow={(item: MasterSparepart) => [
              item.kode,
              item.nama_sparepart,
              item.posisi_part,
            ]}
            onSelect={(item: MasterSparepart) => {
              setKebutuhanSparepart((prev) => {
                const copy = [...prev];
                copy[activeSparepartIndex] = {
                  ...copy[activeSparepartIndex],
                  id_ms_sparepart: item.id,
                  detail_ms_sparepart: {
                    kode: item.kode,
                    nama_sparepart: item.nama_sparepart,
                    nama_mesin: item.nama_mesin,
                    posisi_part: item.posisi_part,
                    sisa_umur: item.sisa_umur,
                    grade: item.grade_2,
                  },
                };
                return copy;
              });
              setShowModalMsStok(false);
            }}
          />
        )}

        {/* ── Sparepart Pengganti Modal ── */}
        {showModalStok && (
          <SparepartModal
            title="Pilih Sparepart Pengganti"
            masterMesin={masterMesin}
            data={displayedStokSparepart}
            columns={['Kode', 'Sparepart', 'Qty', 'Umur', 'Grade']}
            onMesinChange={(id) => getStokSparepart(id)}
            onSearch={(q) => handleSearch(q, 'stokSparepart')}
            onClose={() => setShowModalStok(false)}
            renderRow={(item: SparepartStok) => [
              item.kode,
              item.nama_sparepart,
              item.stok,
              item.umur_sparepart ?? '-',
              item.grade,
            ]}
            onSelect={(item: SparepartStok) => {
              if (!item.stok) return;
              setKebutuhanSparepart((prev) => {
                const copy = [...prev];
                copy[activeSparepartIndex] = {
                  ...copy[activeSparepartIndex],
                  id_stok: item.id,
                  detail_stok: {
                    kode: item.kode,
                    part_number: item.part_number,
                    nama_sparepart: item.nama_sparepart,
                    nama_mesin: item.nama_mesin,
                    lokasi: item.lokasi,
                    umur: item.umur_sparepart,
                    grade: item.grade,
                  },
                };
                return copy;
              });
              setShowModalStok(false);
            }}
          />
        )}

        {children}
      </div>
    </div>
  );
};

// ─── Sparepart Modal ──────────────────────────────────────────────────────────

interface SparepartModalProps<T> {
  title: string;
  masterMesin: MasterMesin[];
  data: T[];
  columns: string[];
  onMesinChange: (id: string) => void;
  onSearch: (q: string) => void;
  onClose: () => void;
  renderRow: (item: T) => (string | number | null | undefined)[];
  onSelect: (item: T) => void;
}

function SparepartModal<T extends { id: number; stok?: number }>({
  title,
  masterMesin,
  data,
  columns,
  onMesinChange,
  onSearch,
  onClose,
  renderRow,
  onSelect,
}: SparepartModalProps<T>) {
  return (
    <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-blue-700">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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

        <div className="px-5 py-3 flex gap-3 border-b border-slate-100">
          <select
            onChange={(e) => onMesinChange(e.target.value)}
            className="flex-1 rounded-xl bg-slate-50 border border-slate-200 text-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="" disabled selected>
              Pilih Mesin
            </option>
            {masterMesin.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nama_mesin}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="flex-1 rounded-xl bg-slate-50 border border-slate-200 text-sm px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Cari sparepart..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  No
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-2.5 font-semibold text-slate-600"
                  >
                    {col}
                  </th>
                ))}
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => {
                const cells = renderRow(item);
                const isOutOfStock =
                  'stok' in item && (item as { stok: number }).stok <= 0;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-slate-500">{idx + 1}</td>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-slate-700">
                        {cell ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5">
                      {isOutOfStock ? (
                        <span className="text-xs text-slate-400 italic">
                          Habis
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelect(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors w-full"
                        >
                          Pilih
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-8 text-center text-slate-400 text-xs"
                  >
                    Pilih mesin terlebih dahulu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ModalStockCheck1;
