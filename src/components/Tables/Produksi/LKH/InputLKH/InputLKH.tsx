import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const API_BASE = import.meta.env.VITE_API_LINK;

// Interfaces
interface JOData {
  spesifikasi: string;
  status_proses: string;
  status: any;
  id: number;
  no_jo: string;
  no_so: string;
  no_io: string;
  customer: string;
  produk: string;
  qty: number;
  tgl_kirim: string;
  status_jo: string;
  tipe_jo: string;
  is_active: boolean;
  createdAt: string;
  jo_mounting?: JOMounting[];
}

interface JOMounting {
  is_selected: unknown;
  id: number;
  id_jo: number;
  id_io_mounting: number;
  id_kertas: number;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
}

interface TahapanData {
  id: number;
  id_tahapan: number;
  status: string;
  tahapan: {
    id: number;
    nama_tahapan: string;
    kode_tahapan: string;
  };
}

interface MesinTahapanResponse {
  id_mesin_tahapan: number;
  mesin: {
    nama_mesin: string;
  };
}

interface KodeProduksi {
  id: number;
  proses_produksi: string;
  kode: string;
  deskripsi: string;
  id_tahapan_produksi: number;
  id_kriteria_qty_produksi: number | null;
  id_kriteria_qty_qc: number | null;
  id_kriteria_qty_mtc: number | null;
  id_kriteria_waktu_produksi: number | null;
  id_kriteria_waktu_qc: number | null;
  id_kriteria_waktu_mtc: number | null;
  id_kriteria_frekuensi_produksi: number | null;
  id_kriteria_frekuensi_qc: number | null;
  id_kriteria_frekuensi_mtc: number | null;
  id_kategori_kendala: number;
  target_department: number[];
}

interface LKHProses {
  id: number;
  id_produksi_lkh: number;
  id_produksi_lkh_tahapan: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  id_kode_produksi: number;
  kode: string;
  deskripsi: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  note: string | null;
  status: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  total_waktu: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LKHResponse {
  id_produksi_lkh_tahapan: null;
  id: number;
  id_jo: number;
  id_tahapan: number;
  id_mesin: number;
  id_operator: number;
  no_jo: string;
  no_io: string;
  no_so: string;
  customer: string;
  produk: string;
  qty_jo: number;
  qty_druk: number | null;
  spesifikasi: string;
  tgl_kirim: string;
  status: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  produksi_lkh_proses: LKHProses[];
}

interface Option {
  value: string;
  label: string;
}

interface FormData {
  no_jo: string;
  no_io: string;
  nama_customer: string;
  produk: string;
  qty: number;
  spek: string;
  qty_druk: number;
  proses: string;
  mesin: string;
  bagian: string;
  operator: string;
  tanggal: string;
}

interface ProcessData {
  detail: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  pallet: number;
  note: string;
}

// Fixed process list
const FIXED_PROCESSES = [
  { name: 'Setting', color: 'blue' },
  { name: 'Produksi', color: 'green' },
  { name: 'Kendala', color: 'yellow' },
  { name: 'Pending', color: 'orange' },
  { name: 'Off', color: 'red' },
  { name: 'Waste', color: 'gray' },
];

// Custom styles for react-select (compact version)
const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: '32px',
    fontSize: '0.875rem',
    borderColor: '#d1d5db',
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: '32px',
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: '0.875rem',
  }),
};

const InputLKH: React.FC = () => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [joList, setJoList] = useState<JOData[]>([]);
  const [selectedJO, setSelectedJO] = useState<JOData | null>(null);
  const [tahapanList, setTahapanList] = useState<TahapanData[]>([]);
  const [selectedTahapan, setSelectedTahapan] = useState<number | null>(null);
  const [mesinOptions, setMesinOptions] = useState<Option[]>([]);
  const [selectedMesin, setSelectedMesin] = useState<string>('');
  const [kodeProduksiByProcess, setKodeProduksiByProcess] = useState<{
    [key: string]: KodeProduksi[];
  }>({});
  const [activeProcesses, setActiveProcesses] = useState<{
    [key: string]: LKHProses;
  }>({});
  const [userId, setUserId] = useState<number | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishData, setFinishData] = useState<LKHProses[]>([]);
  const [idProduksiLkh, setIdProduksiLkh] = useState<number | null>(null);
  const [idProduksiLkhTahapan, setIdProduksiLkhTahapan] = useState<
    number | null
  >(null);
  const [sendRequestToSpv, setSendRequestToSpv] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    no_jo: '',
    no_io: '',
    nama_customer: '',
    produk: '',
    qty: 0,
    spek: '',
    qty_druk: 0,
    proses: 'Cetak 1',
    mesin: 'R700',
    bagian: 'Cetak',
    operator: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const [processDataList, setProcessDataList] = useState<{
    [key: string]: ProcessData;
  }>({
    Setting: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
    Produksi: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
    Kendala: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
    Pending: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
    Off: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
    Waste: {
      detail: '',
      baik: 0,
      rusak_sebagian: 0,
      rusak_total: 0,
      pallet: 0,
      note: '',
    },
  });

  // Calculate QTY Druk based on jo_mounting data
  const calculateQtyDruk = useCallback((jo: JOData) => {
    if (jo.jo_mounting && jo.jo_mounting.length > 0) {
      const mounting =
        jo.jo_mounting.find((m) => m.is_selected) || jo.jo_mounting[0];
      if (mounting && mounting.ukuran_cetak_isi_1 > 0) {
        return Math.ceil(jo.qty / mounting.ukuran_cetak_isi_1);
      }
    }
    return 0;
  }, []);

  // Fetch User Data
  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/me`, {
        withCredentials: true,
      });
      setUserId(response.data.id);
      setFormData((prev) => ({ ...prev, operator: response.data.nama || '' }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Gagal mengambil data user');
    }
  }, []);

  // Fetch JO List
  const fetchJOList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ppic/jo`, {
        params: { status_proses: 'done' },
        withCredentials: true,
      });
      setJoList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching JO list:', error);
      toast.error('Gagal mengambil data JO');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Tahapan by JO
  const fetchTahapan = useCallback(async (id_jo: number) => {
    try {
      const response = await axios.get(`${API_BASE}/produksi/lkhTahapan`, {
        params: { status: 'active', id_jo },
        withCredentials: true,
      });
      setTahapanList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tahapan:', error);
      toast.error('Gagal mengambil data tahapan');
    }
  }, []);

  // Fetch Mesin by Tahapan
  const fetchMesinByTahapan = useCallback(async (id_tahapan: number) => {
    try {
      const response = await axios.get(`${API_BASE}/master/tahapanMesin`, {
        params: { id_tahapan },
        withCredentials: true,
      });

      const options: Option[] = response.data.data.map(
        (item: MesinTahapanResponse) => ({
          value: String(item.id_mesin_tahapan),
          label: item.mesin.nama_mesin,
        }),
      );
      setMesinOptions(options);
    } catch (error) {
      console.error('Error fetching mesin:', error);
      toast.error('Gagal mengambil data mesin');
    }
  }, []);

  // Fetch Kode Produksi for each process type
  const fetchKodeProduksi = useCallback(async (id_tahapan?: number) => {
    try {
      const params: any = {};
      if (id_tahapan) {
        params.id_tahapan_produksi = id_tahapan;
      }

      const response = await axios.get(
        `${API_BASE}/master/produksi/kodeProduksi`,
        {
          params,
          withCredentials: true,
        },
      );

      console.log('All Kode Produksi Response:', response.data.data);

      // Filter dan group berdasarkan proses_produksi
      const allKodeProduksi = response.data.data || [];
      const kodeProduksiData: { [key: string]: KodeProduksi[] } = {};

      // Inisialisasi untuk setiap proses
      FIXED_PROCESSES.forEach((process) => {
        kodeProduksiData[process.name] = allKodeProduksi.filter(
          (kode: KodeProduksi) => kode.proses_produksi === process.name,
        );
      });

      console.log('Filtered Kode Produksi by Process:', kodeProduksiData);
      setKodeProduksiByProcess(kodeProduksiData);
    } catch (error) {
      console.error('Error fetching kode produksi:', error);
      toast.error('Gagal mengambil data kode produksi');
    }
  }, []);

  // Fetch Active LKH Processes - Updated with same params as fetchDoneLKHProcesses
  const fetchActiveLKH = useCallback(async () => {
    if (!selectedJO || !selectedTahapan || !userId) return;

    try {
      const response = await axios.get(`${API_BASE}/produksi/lkh`, {
        params: {
          id_jo: selectedJO.id,
          id_operator: userId,
          id_tahapan: selectedTahapan,
          // Tambahan: bisa juga filter untuk status progress jika diperlukan
          // status_lkh_proses: 'progress',
        },
        withCredentials: true,
      });

      console.log('Active LKH Response:', response.data.data);

      const activeLKH: { [key: string]: LKHProses } = {};

      // Loop through the response data
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((lkh: LKHResponse) => {
          // Store OUTER id (id from LKHResponse) for finish API
          if (lkh.id) {
            setIdProduksiLkh(lkh.id); // This is the outer id we need
            setIdProduksiLkhTahapan(lkh.id_produksi_lkh_tahapan || null);
          }

          // Loop through produksi_lkh_proses array
          if (lkh.produksi_lkh_proses && lkh.produksi_lkh_proses.length > 0) {
            lkh.produksi_lkh_proses.forEach((proses: LKHProses) => {
              // Only add processes that are still in progress (waktu_selesai is null)
              if (!proses.waktu_selesai && proses.status === 'progress') {
                // Find which process type this belongs to by matching kode_produksi
                for (const processName of FIXED_PROCESSES.map((p) => p.name)) {
                  const kodeProd = kodeProduksiByProcess[processName]?.find(
                    (k) => k.id === proses.id_kode_produksi,
                  );
                  if (kodeProd) {
                    activeLKH[processName] = proses;
                    break;
                  }
                }
              }
            });
          }
        });
      }

      console.log('Parsed Active Processes:', activeLKH);
      console.log('Outer ID for Finish API:', idProduksiLkh);
      setActiveProcesses(activeLKH);
    } catch (error) {
      console.error('Error fetching active LKH:', error);
    }
  }, [selectedJO, selectedTahapan, userId, kodeProduksiByProcess]);

  // Update useEffect dependency untuk fetchActiveLKH
  useEffect(() => {
    if (
      selectedJO &&
      selectedTahapan &&
      userId && // Added userId dependency
      Object.keys(kodeProduksiByProcess).length > 0
    ) {
      fetchActiveLKH();
    }
  }, [
    selectedJO,
    selectedTahapan,
    userId,
    kodeProduksiByProcess,
    fetchActiveLKH,
  ]);

  const hasActiveProcess = useCallback(() => {
    return Object.keys(activeProcesses).length > 0;
  }, [activeProcesses]);

  // Check if specific process is active
  const isProcessActive = useCallback(
    (processName: string) => {
      return !!activeProcesses[processName];
    },
    [activeProcesses],
  );

  // Handle JO Selection
  const handleJOSelect = useCallback(
    async (jo: JOData) => {
      setSelectedJO(jo);
      const calculatedQtyDruk = calculateQtyDruk(jo);

      setFormData((prev) => ({
        ...prev,
        no_jo: jo.no_jo,
        no_io: jo.no_io,
        spek: jo.spesifikasi,
        nama_customer: jo.customer,
        produk: jo.produk,
        qty: jo.qty,
        qty_druk: calculatedQtyDruk,
      }));

      await fetchTahapan(jo.id);
      setSelectedTahapan(null);
      setSelectedMesin('');
      setMesinOptions([]);
    },
    [fetchTahapan, calculateQtyDruk],
  );

  const handleTahapanSelect = useCallback(
    async (tahapanId: number) => {
      setSelectedTahapan(tahapanId);
      await fetchMesinByTahapan(tahapanId);
      await fetchKodeProduksi(tahapanId);
      setSelectedMesin('');
    },
    [fetchMesinByTahapan, fetchKodeProduksi],
  );

  // Get kode produksi ID for a process from the detail dropdown
  const getKodeProduksiIdFromDetail = useCallback(
    (processName: string) => {
      const processData = processDataList[processName];
      if (!processData.detail) return null;
      return parseInt(processData.detail);
    },
    [processDataList],
  );

  // Handle Process Start
  const handleStartProcess = useCallback(
    async (processName: string) => {
      if (hasActiveProcess()) {
        toast.error(
          'Harap selesaikan proses yang sedang berjalan terlebih dahulu',
        );
        return;
      }

      const kodeProduksiId = getKodeProduksiIdFromDetail(processName);

      if (!kodeProduksiId) {
        toast.error('Mohon pilih detail proses terlebih dahulu');
        return;
      }

      if (!selectedJO || !selectedTahapan || !selectedMesin || !userId) {
        toast.error('Mohon lengkapi semua data terlebih dahulu');
        return;
      }

      try {
        setLoading(true);

        const res = await axios.put(
          `${API_BASE}/produksi/lkhProses/start`,
          {
            id_jo: selectedJO.id,
            id_tahapan: selectedTahapan,
            id_mesin: parseInt(selectedMesin),
            id_operator: userId,
            id_kode_produksi: kodeProduksiId,
          },
          {
            withCredentials: true,
          },
        );

        console.log('Start Process Response:', res.data);

        // Get the kode and deskripsi from kodeProduksiByProcess
        const kodeProd = kodeProduksiByProcess[processName]?.find(
          (k) => k.id === kodeProduksiId,
        );

        // Create a temporary LKH data object for the active process
        const newActiveLKH: LKHProses = {
          id: res.data.data?.id || Date.now(),
          id_produksi_lkh: res.data.data?.id_produksi_lkh || 0,
          id_produksi_lkh_tahapan: res.data.data?.id_produksi_lkh_tahapan || 0,
          id_tahapan: selectedTahapan,
          id_mesin: parseInt(selectedMesin),
          id_operator: userId,
          id_kode_produksi: kodeProduksiId,
          kode: kodeProd?.kode || '',
          deskripsi: kodeProd?.deskripsi || '',
          baik: 0,
          rusak_sebagian: 0,
          rusak_total: 0,
          pallet: 0,
          note: null,
          status: 'progress',
          waktu_mulai: new Date().toISOString(),
          waktu_selesai: null,
          total_waktu: null,
          is_active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update active processes immediately
        setActiveProcesses((prev) => ({
          ...prev,
          [processName]: newActiveLKH,
        }));

        toast.success(`Proses ${processName} dimulai`);

        // Optionally fetch the latest data to sync with backend
        await fetchActiveLKH();
      } catch (error: any) {
        console.error('Error starting process:', error);
        toast.error(error.response?.data?.message || 'Gagal memulai proses');
      } finally {
        setLoading(false);
      }
    },
    [
      hasActiveProcess,
      getKodeProduksiIdFromDetail,
      selectedJO,
      selectedTahapan,
      selectedMesin,
      userId,
      kodeProduksiByProcess,
      fetchActiveLKH,
    ],
  );

  // Handle Process Stop
  const handleStopProcess = useCallback(
    async (processName: string) => {
      const activeLKH = activeProcesses[processName];
      if (!activeLKH) {
        toast.error('Proses tidak ditemukan');
        return;
      }

      const processData = processDataList[processName];

      try {
        setLoading(true);
        const res = await axios.put(
          `${API_BASE}/produksi/lkhProses/stop/${activeLKH.id}`,
          {
            baik: processData.baik || 0,
            rusak_sebagian: processData.rusak_sebagian || 0,
            rusak_total: processData.rusak_total || 0,
            pallet: processData.pallet || 0,
            note: processData.note || '',
          },
          {
            withCredentials: true,
          },
        );

        console.log('Stop Process Response:', res.data);

        // Remove from active processes immediately
        setActiveProcesses((prev) => {
          const newActiveProcesses = { ...prev };
          delete newActiveProcesses[processName];
          return newActiveProcesses;
        });

        // Reset process data
        setProcessDataList((prev) => ({
          ...prev,
          [processName]: {
            detail: '',
            baik: 0,
            rusak_sebagian: 0,
            rusak_total: 0,
            pallet: 0,
            note: '',
          },
        }));

        toast.success(`Proses ${processName} dihentikan`);

        // Optionally fetch the latest data to sync with backend
        await fetchActiveLKH();
      } catch (error: any) {
        console.error('Error stopping process:', error);
        toast.error(
          error.response?.data?.message || 'Gagal menghentikan proses',
        );
      } finally {
        setLoading(false);
      }
    },
    [activeProcesses, processDataList, fetchActiveLKH],
  );

  // Handle Process Data Change
  const handleProcessDataChange = useCallback(
    (processName: string, field: keyof ProcessData, value: string | number) => {
      setProcessDataList((prev) => ({
        ...prev,
        [processName]: {
          ...prev[processName],
          [field]: value,
        },
      }));
    },
    [],
  );

  const fetchDoneLKHProcesses = useCallback(async () => {
    if (!selectedJO || !selectedTahapan || !userId) return;

    try {
      const response = await axios.get(`${API_BASE}/produksi/lkh`, {
        params: {
          id_jo: selectedJO.id,
          id_operator: userId,
          id_tahapan: selectedTahapan,
          status_lkh_proses: 'done',
        },
        withCredentials: true,
      });

      console.log('Done LKH Response:', response.data.data);

      const doneProcesses: LKHProses[] = [];
      let outerIdForFinish: number | null = null;
      let idProduksiLkhTahapanForFinish: number | null = null;

      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((lkh: LKHResponse) => {
          // Store the OUTER id from the first LKH entry
          if (!outerIdForFinish && lkh.id) {
            outerIdForFinish = lkh.id; // This is what we need for the API
            idProduksiLkhTahapanForFinish = lkh.id_produksi_lkh_tahapan || null;
          }

          if (lkh.produksi_lkh_proses && lkh.produksi_lkh_proses.length > 0) {
            lkh.produksi_lkh_proses.forEach((proses: LKHProses) => {
              if (proses.status === 'done') {
                doneProcesses.push(proses);
              }
            });
          }
        });
      }

      // Update state with the outer id
      if (outerIdForFinish) {
        setIdProduksiLkh(outerIdForFinish);
        setIdProduksiLkhTahapan(idProduksiLkhTahapanForFinish);
      }

      console.log('Outer ID for Finish API:', outerIdForFinish);
      console.log('Done Processes:', doneProcesses);

      setFinishData(doneProcesses);
      setSendRequestToSpv(true); // Reset to true when opening modal
      setShowFinishModal(true);
    } catch (error) {
      console.error('Error fetching done LKH:', error);
      toast.error('Gagal mengambil data proses selesai');
    }
  }, [selectedJO, selectedTahapan, userId]);
  // Handle Finish Modal Data Change
  const handleFinishDataChange = useCallback(
    (index: number, field: keyof LKHProses, value: string | number) => {
      setFinishData((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                [field]: field === 'note' ? value : Number(value) || 0,
              }
            : item,
        ),
      );
    },
    [],
  );

  const handleFinishSubmit = useCallback(async () => {
    if (!idProduksiLkh) {
      toast.error('ID Produksi LKH tidak ditemukan');
      return;
    }

    if (!idProduksiLkhTahapan) {
      toast.error('ID Produksi LKH Tahapan tidak ditemukan');
      return;
    }

    if (finishData.length === 0) {
      toast.error('Tidak ada data proses untuk diselesaikan');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id_produksi_lkh_tahapan: idProduksiLkhTahapan,
        send_request_to_spv: sendRequestToSpv, // Use state value
        produksi_lkh_proses: finishData.map((item) => ({
          id: item.id,
          id_produksi_lkh: item.id_produksi_lkh,
          id_produksi_lkh_tahapan: item.id_produksi_lkh_tahapan,
          id_tahapan: item.id_tahapan,
          id_mesin: item.id_mesin,
          id_operator: item.id_operator,
          id_kode_produksi: item.id_kode_produksi,
          kode: item.kode,
          deskripsi: item.deskripsi,
          baik: item.baik || 0,
          rusak_sebagian: item.rusak_sebagian || 0,
          rusak_total: item.rusak_total || 0,
          pallet: item.pallet || 0,
          note: item.note || '',
        })),
      };

      console.log('Finish Payload:', payload);
      console.log('Using Outer ID for API:', idProduksiLkh);

      // Use the OUTER id (not id_produksi_lkh_tahapan) in the URL
      await axios.put(
        `${API_BASE}/produksi/lkhTahapan/finish/${idProduksiLkh}`,
        payload,
        {
          withCredentials: true,
        },
      );

      toast.success('Data LKH berhasil diselesaikan');
      setShowFinishModal(false);
      setFinishData([]);
      setSendRequestToSpv(true); // Reset to default

      // Reset form
      setSelectedJO(null);
      setSelectedTahapan(null);
      setSelectedMesin('');
      setIdProduksiLkh(null);
      setIdProduksiLkhTahapan(null);
      setFormData({
        no_jo: '',
        no_io: '',
        nama_customer: '',
        produk: '',
        qty: 0,
        spek: '',
        qty_druk: 0,
        proses: 'Cetak 1',
        mesin: 'R700',
        bagian: 'Cetak',
        operator: formData.operator,
        tanggal: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error('Error finishing LKH:', error);
      toast.error(
        error.response?.data?.message || 'Gagal menyelesaikan data LKH',
      );
    } finally {
      setLoading(false);
    }
  }, [
    idProduksiLkh,
    idProduksiLkhTahapan,
    finishData,
    sendRequestToSpv,
    formData.operator,
  ]);

  // Initial Load
  useEffect(() => {
    fetchUserData();
    fetchJOList();
  }, [fetchUserData, fetchJOList]);

  // Fetch active processes when dependencies change
  useEffect(() => {
    if (
      selectedJO &&
      selectedTahapan &&
      Object.keys(kodeProduksiByProcess).length > 0
    ) {
      fetchActiveLKH();
    }
  }, [selectedJO, selectedTahapan, kodeProduksiByProcess, fetchActiveLKH]);

  // Convert data to react-select options
  const joOptions = joList.map((jo) => ({
    value: String(jo.id),
    label: jo.no_jo,
  }));

  const tahapanOptions = tahapanList.map((tahapan) => ({
    value: String(tahapan.tahapan.id),
    label: tahapan.tahapan.nama_tahapan,
  }));

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className=" mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Side - Form */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b">
                Informasi Job Order
              </h2>

              <div className="space-y-2">
                {/* No. JO */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    No. JO <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={joOptions}
                    value={
                      selectedJO
                        ? joOptions.find(
                            (opt) => opt.value === String(selectedJO.id),
                          )
                        : null
                    }
                    onChange={(option) => {
                      if (option) {
                        const jo = joList.find(
                          (j) => j.id === parseInt(option.value),
                        );
                        if (jo) handleJOSelect(jo);
                      }
                    }}
                    styles={selectStyles}
                    placeholder="Pilih JO"
                    isDisabled={loading}
                    isClearable
                  />
                </div>

                {/* No. IO */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    No. IO
                  </label>
                  <input
                    type="text"
                    value={formData.no_io}
                    readOnly
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                {/* Nama Customer */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nama Customer
                  </label>
                  <input
                    type="text"
                    value={formData.nama_customer}
                    readOnly
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                {/* Produk */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Produk
                  </label>
                  <textarea
                    value={formData.produk}
                    readOnly
                    rows={2}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* QTY */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      QTY (pcs)
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  {/* QTY Druk */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      QTY Druk
                    </label>
                    <input
                      type="number"
                      value={formData.qty_druk}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>

                {/* Spek */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Spek
                  </label>
                  <input
                    type="text"
                    value={formData.spek}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, spek: e.target.value }))
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Masukkan spesifikasi"
                  />
                </div>

                <div className="pt-2 border-t">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">
                    Konfigurasi Proses
                  </h3>

                  {/* Proses */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Proses <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={tahapanOptions}
                      value={
                        selectedTahapan
                          ? tahapanOptions.find(
                              (opt) => opt.value === String(selectedTahapan),
                            )
                          : null
                      }
                      onChange={(option) => {
                        if (option) {
                          handleTahapanSelect(parseInt(option.value));
                        }
                      }}
                      styles={selectStyles}
                      placeholder="Pilih Proses"
                      isDisabled={!selectedJO || loading}
                      isClearable
                    />
                  </div>

                  {/* Mesin */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Mesin <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={mesinOptions}
                      value={
                        selectedMesin
                          ? mesinOptions.find(
                              (opt) => opt.value === selectedMesin,
                            )
                          : null
                      }
                      onChange={(option) => {
                        setSelectedMesin(option ? option.value : '');
                      }}
                      styles={selectStyles}
                      placeholder="Pilih Mesin"
                      isDisabled={!selectedTahapan || loading}
                      isClearable
                    />
                  </div>

                  {/* Operator */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Operator
                    </label>
                    <input
                      type="text"
                      value={formData.operator}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tanggal: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Process Control */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <h2 className="text-base font-semibold text-gray-800">
                  Kontrol Proses Produksi
                </h2>
                {hasActiveProcess() && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Proses Berjalan
                  </span>
                )}
              </div>

              {!selectedTahapan || !selectedMesin ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Belum ada data proses
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Silakan pilih JO, Proses, dan Mesin terlebih dahulu
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {FIXED_PROCESSES.map((process) => {
                    const isActive = isProcessActive(process.name);
                    const processData = processDataList[process.name] || {
                      detail: '',
                      baik: 0,
                      rusak_sebagian: 0,
                      rusak_total: 0,
                      pallet: 0,
                      note: '',
                    };

                    // Get kode produksi options for this specific process
                    const kodeProduksiOptions = (
                      kodeProduksiByProcess[process.name] || []
                    ).map((kode) => ({
                      value: String(kode.id),
                      label: `${kode.kode} - ${kode.deskripsi}`,
                    }));

                    return (
                      <div
                        key={process.name}
                        className={`border rounded-lg p-2 transition-all ${
                          isActive
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isActive
                                  ? 'bg-green-500 animate-pulse'
                                  : 'bg-gray-300'
                              }`}
                            />
                            <h3 className="font-semibold text-sm text-gray-800">
                              {process.name}
                            </h3>
                            {isActive && activeProcesses[process.name] && (
                              <span className="text-xs text-gray-600">
                                ({activeProcesses[process.name].kode} -{' '}
                                {activeProcesses[process.name].deskripsi})
                              </span>
                            )}
                          </div>
                          {isActive ? (
                            <button
                              onClick={() => handleStopProcess(process.name)}
                              className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={loading}
                            >
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartProcess(process.name)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              disabled={
                                loading ||
                                hasActiveProcess() ||
                                !selectedMesin ||
                                !processData.detail
                              }
                            >
                              Start
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {/* First Row: Detail and Keterangan */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Detail - Searchable Dropdown with kode produksi options */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Detail <span className="text-red-500">*</span>
                              </label>
                              <Select
                                options={kodeProduksiOptions}
                                value={
                                  processData.detail
                                    ? kodeProduksiOptions.find(
                                        (opt) =>
                                          opt.value === processData.detail,
                                      )
                                    : null
                                }
                                onChange={(option) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'detail',
                                    option ? option.value : '',
                                  )
                                }
                                styles={selectStyles}
                                placeholder="Pilih Detail"
                                isDisabled={isActive}
                                isClearable
                                noOptionsMessage={() => 'Tidak ada data'}
                              />
                            </div>

                            {/* Keterangan */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Keterangan
                              </label>
                              <input
                                type="text"
                                value={processData.note}
                                onChange={(e) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'note',
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!isActive}
                                placeholder="Catatan"
                              />
                            </div>
                          </div>

                          {/* Second Row: Number Inputs */}
                          <div className="grid grid-cols-4 gap-2">
                            {/* Baik */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Baik
                              </label>
                              <input
                                type="number"
                                value={processData.baik || ''}
                                onChange={(e) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'baik',
                                    e.target.value ? Number(e.target.value) : 0,
                                  )
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!isActive}
                                placeholder="0"
                              />
                            </div>

                            {/* Rusak Sebagian */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Rusak Sebagian
                              </label>
                              <input
                                type="number"
                                value={processData.rusak_sebagian || ''}
                                onChange={(e) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'rusak_sebagian',
                                    e.target.value ? Number(e.target.value) : 0,
                                  )
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!isActive}
                                placeholder="0"
                              />
                            </div>

                            {/* Rusak Total */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Rusak Total
                              </label>
                              <input
                                type="number"
                                value={processData.rusak_total || ''}
                                onChange={(e) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'rusak_total',
                                    e.target.value ? Number(e.target.value) : 0,
                                  )
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!isActive}
                                placeholder="0"
                              />
                            </div>

                            {/* Pallet */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Pallet
                              </label>
                              <input
                                type="number"
                                value={processData.pallet || ''}
                                onChange={(e) =>
                                  handleProcessDataChange(
                                    process.name,
                                    'pallet',
                                    e.target.value ? Number(e.target.value) : 0,
                                  )
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={!isActive}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              {selectedTahapan && selectedMesin && (
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      toast.info(
                        'Kirim Checksheet - Implementasi sesuai kebutuhan',
                      );
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    Kirim Checksheet
                  </button>
                  <button
                    onClick={() => {
                      if (hasActiveProcess()) {
                        toast.error(
                          'Harap selesaikan semua proses yang sedang berjalan',
                        );
                        return;
                      }
                      fetchDoneLKHProcesses();
                    }}
                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={hasActiveProcess()}
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFinishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Data Proses Selesai
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Periksa dan edit data sebelum menyelesaikan LKH
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Checkbox for Send Request to SPV */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendRequestToSpv}
                    onChange={(e) => setSendRequestToSpv(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    Kirim Request ke Supervisor
                  </span>
                </label>
                <p className="ml-6 text-xs text-gray-600 mt-1">
                  {sendRequestToSpv
                    ? 'Data akan dikirim ke supervisor untuk review'
                    : 'Data akan disimpan tanpa notifikasi ke supervisor'}
                </p>
              </div>

              {finishData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data proses selesai</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Baik
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rusak Sebagian
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rusak Total
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pallet
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Catatan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {finishData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {item.kode}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {item.deskripsi}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.baik || ''}
                              onChange={(e) =>
                                handleFinishDataChange(
                                  index,
                                  'baik',
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.rusak_sebagian || ''}
                              onChange={(e) =>
                                handleFinishDataChange(
                                  index,
                                  'rusak_sebagian',
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.rusak_total || ''}
                              onChange={(e) =>
                                handleFinishDataChange(
                                  index,
                                  'rusak_total',
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.pallet || ''}
                              onChange={(e) =>
                                handleFinishDataChange(
                                  index,
                                  'pallet',
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.note || ''}
                              onChange={(e) =>
                                handleFinishDataChange(
                                  index,
                                  'note',
                                  e.target.value,
                                )
                              }
                              className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Catatan"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowFinishModal(false);
                  setFinishData([]);
                  setSendRequestToSpv(true); // Reset when closing
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleFinishSubmit}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={loading || finishData.length === 0}
              >
                {loading ? 'Memproses...' : 'Selesaikan LKH'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputLKH;
