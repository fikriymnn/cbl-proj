import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobOrderForm from './JobOrderForm';
import ProcessControl from './ProcessControl';
import FinishLKHModal from './FinishLKHModal';
import {
  JOData,
  TahapanData,
  Option,
  FormData,
  ProcessData,
  KodeProduksi,
  LKHProses,
  LKHResponse,
  MesinTahapanResponse,
  WasteData,
  WasteProcessData,
  LKHWaste,
} from './types';
import { FIXED_PROCESSES } from './constants';

const API_BASE = import.meta.env.VITE_API_LINK;

const InputLKH: React.FC = () => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [joList, setJoList] = useState<JOData[]>([]);
  const [selectedJO, setSelectedJO] = useState<JOData | null>(null);
  const [tahapanList, setTahapanList] = useState<TahapanData[]>([]);
  const [selectedTahapan, setSelectedTahapan] = useState<number | null>(null);
  const [selectedTahapanName, setSelectedTahapanName] = useState<string>('');
  const [mesinOptions, setMesinOptions] = useState<Option[]>([]);
  const [selectedMesin, setSelectedMesin] = useState<string>('');
  const [kodeProduksiByProcess, setKodeProduksiByProcess] = useState<{
    [key: string]: KodeProduksi[];
  }>({});
  const [wasteKendalaList, setWasteKendalaList] = useState<WasteData[]>([]);
  const [activeProcesses, setActiveProcesses] = useState<{
    [key: string]: LKHProses;
  }>({});
  const [userId, setUserId] = useState<number | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishData, setFinishData] = useState<LKHProses[]>([]);
  const [finishWasteData, setFinishWasteData] = useState<LKHWaste[]>([]);
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
  });

  const [wasteProcessData, setWasteProcessData] = useState<WasteProcessData>({
    id_waste: '',
    id_kendala: '',
    total_qty: 0,
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

  // Fetch JO List — then restore persisted selection if any
  const fetchJOList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ppic/jo`, {
        params: { status_proses: 'done' },
        withCredentials: true,
      });
      console.log('JO List Response:', response.data);
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

      const allKodeProduksi = response.data.data || [];
      const kodeProduksiData: { [key: string]: KodeProduksi[] } = {};

      FIXED_PROCESSES.forEach((process) => {
        if (process.name !== 'Waste') {
          kodeProduksiData[process.name] = allKodeProduksi.filter(
            (kode: KodeProduksi) => kode.proses_produksi === process.name,
          );
        }
      });

      setKodeProduksiByProcess(kodeProduksiData);
    } catch (error) {
      console.error('Error fetching kode produksi:', error);
      toast.error('Gagal mengambil data kode produksi');
    }
  }, []);

  // Fetch Waste Kendala List
  const fetchWasteKendala = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/master/produksi/wasteKendala`,
        {
          withCredentials: true,
        },
      );

      setWasteKendalaList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching waste kendala:', error);
      toast.error('Gagal mengambil data waste kendala');
    }
  }, []);

  // Fetch Active LKH Processes
  const fetchActiveLKH = useCallback(async () => {
    if (!selectedJO || !selectedTahapan || !userId) return;

    try {
      const response = await axios.get(`${API_BASE}/produksi/lkh`, {
        params: {
          id_jo: selectedJO.id,
          id_operator: userId,
          id_tahapan: selectedTahapan,
        },
        withCredentials: true,
      });

      const activeLKH: { [key: string]: LKHProses } = {};

      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((lkh: LKHResponse) => {
          if (lkh.id) {
            setIdProduksiLkh(lkh.id);
            setIdProduksiLkhTahapan(lkh.id_produksi_lkh_tahapan || null);
          }

          if (lkh.produksi_lkh_proses && lkh.produksi_lkh_proses.length > 0) {
            lkh.produksi_lkh_proses.forEach((proses: LKHProses) => {
              if (!proses.waktu_selesai && proses.status === 'progress') {
                for (const processName of FIXED_PROCESSES.map((p) => p.name)) {
                  if (processName === 'Waste') continue;
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

      setActiveProcesses(activeLKH);
    } catch (error) {
      console.error('Error fetching active LKH:', error);
    }
  }, [selectedJO, selectedTahapan, userId, kodeProduksiByProcess]);

  const hasActiveProcess = useCallback(() => {
    return Object.keys(activeProcesses).length > 0;
  }, [activeProcesses]);

  // Check if current tahapan is SORTIR
  const isSortirProcess = useCallback(() => {
    return selectedTahapanName.toLowerCase().includes('sortir');
  }, [selectedTahapanName]);

  // Handle JO Selection
  const handleJOSelect = useCallback(
    async (option: Option | null) => {
      if (!option) {
        setSelectedJO(null);
        localStorage.removeItem('lkh_selected_jo_id');
        localStorage.removeItem('lkh_selected_tahapan_id');
        localStorage.removeItem('lkh_selected_mesin');
        return;
      }

      const jo = joList.find((j) => j.id === parseInt(option.value));
      if (!jo) return;

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

      // Persist JO selection
      localStorage.setItem('lkh_selected_jo_id', String(jo.id));
      localStorage.removeItem('lkh_selected_tahapan_id');
      localStorage.removeItem('lkh_selected_mesin');

      await fetchTahapan(jo.id);
      setSelectedTahapan(null);
      setSelectedTahapanName('');
      setSelectedMesin('');
      setMesinOptions([]);
    },
    [joList, fetchTahapan, calculateQtyDruk],
  );

  const handleTahapanSelect = useCallback(
    async (option: Option | null) => {
      if (!option) {
        setSelectedTahapan(null);
        setSelectedTahapanName('');
        return;
      }

      const tahapanId = parseInt(option.value);
      const tahapan = tahapanList.find((t) => t.tahapan.id === tahapanId);

      setSelectedTahapan(tahapanId);
      setSelectedTahapanName(tahapan?.tahapan.nama_tahapan || '');

      // Persist tahapan selection
      localStorage.setItem('lkh_selected_tahapan_id', String(tahapanId));
      localStorage.removeItem('lkh_selected_mesin');

      await fetchMesinByTahapan(tahapanId);
      await fetchKodeProduksi(tahapanId);
      await fetchWasteKendala();

      setSelectedMesin('');

      // Reset waste data
      setWasteProcessData({
        id_waste: '',
        id_kendala: '',
        total_qty: 0,
      });
    },
    [fetchMesinByTahapan, fetchKodeProduksi, fetchWasteKendala, tahapanList],
  );

  const handleMesinSelect = useCallback((option: Option | null) => {
    const val = option ? option.value : '';
    setSelectedMesin(val);
    if (val) {
      localStorage.setItem('lkh_selected_mesin', val);
    } else {
      localStorage.removeItem('lkh_selected_mesin');
    }
  }, []);

  // Get kode produksi ID from detail dropdown
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

        const kodeProd = kodeProduksiByProcess[processName]?.find(
          (k) => k.id === kodeProduksiId,
        );

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

        setActiveProcesses((prev) => ({
          ...prev,
          [processName]: newActiveLKH,
        }));

        toast.success(`Proses ${processName} dimulai`);
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

  // Handle Waste Submit (kept for backward compat, now mainly used via WasteModal)
  const handleWasteSubmit = useCallback(async () => {
    if (!wasteProcessData.id_waste || !wasteProcessData.id_kendala) {
      toast.error('Mohon pilih waste dan kendala terlebih dahulu');
      return;
    }

    if (wasteProcessData.total_qty <= 0) {
      toast.error('Total qty harus lebih dari 0');
      return;
    }

    if (!selectedJO || !selectedTahapan || !selectedMesin || !userId) {
      toast.error('Mohon lengkapi semua data terlebih dahulu');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE}/produksi/lkhWaste`,
        {
          id_jo: selectedJO.id,
          id_tahapan: selectedTahapan,
          id_mesin: parseInt(selectedMesin),
          id_operator: userId,
          id_kendala: parseInt(wasteProcessData.id_kendala),
          id_waste: parseInt(wasteProcessData.id_waste),
          total_qty: wasteProcessData.total_qty,
        },
        {
          withCredentials: true,
        },
      );

      toast.success('Data waste berhasil disimpan');

      setWasteProcessData({
        id_waste: '',
        id_kendala: '',
        total_qty: 0,
      });
    } catch (error: any) {
      console.error('Error submitting waste:', error);
      toast.error(
        error.response?.data?.message || 'Gagal menyimpan data waste',
      );
    } finally {
      setLoading(false);
    }
  }, [wasteProcessData, selectedJO, selectedTahapan, selectedMesin, userId]);

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
        await axios.put(
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

        setActiveProcesses((prev) => {
          const newActiveProcesses = { ...prev };
          delete newActiveProcesses[processName];
          return newActiveProcesses;
        });

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

  // Handle Waste Process Data Change
  const handleWasteProcessDataChange = useCallback(
    (field: keyof WasteProcessData, value: string | number) => {
      setWasteProcessData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Fetch Done LKH Processes
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

      const doneProcesses: LKHProses[] = [];
      const wasteData: LKHWaste[] = [];
      let outerIdForFinish: number | null = null;
      let idProduksiLkhTahapanForFinish: number | null = null;

      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach((lkh: LKHResponse) => {
          if (!outerIdForFinish && lkh.id) {
            outerIdForFinish = lkh.id;
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

      // produksi_lkh_waste is returned at the top level of the response, not nested inside data items
      if (
        response.data.produksi_lkh_waste &&
        response.data.produksi_lkh_waste.length > 0
      ) {
        response.data.produksi_lkh_waste.forEach((waste: LKHWaste) => {
          wasteData.push(waste);
        });
      }

      if (outerIdForFinish) {
        setIdProduksiLkh(outerIdForFinish);
        setIdProduksiLkhTahapan(idProduksiLkhTahapanForFinish);
      }

      setFinishData(doneProcesses);
      setFinishWasteData(wasteData);
      setSendRequestToSpv(true);
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

  // Handle Finish Waste Data Change
  const handleFinishWasteDataChange = useCallback(
    (index: number, field: keyof LKHWaste, value: string | number) => {
      setFinishWasteData((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;

          if (field === 'id_waste') {
            const wasteId = Number(value);
            const wasteItem = wasteKendalaList.find((w) => w.id === wasteId);
            return {
              ...item,
              id_waste: wasteId,
              kode_waste: wasteItem?.kode || '',
              deskripsi_waste: wasteItem?.deskripsi || '',
              id_kendala: 0,
              kode_kendala: '',
              deskripsi_kendala: '',
            };
          }

          if (field === 'id_kendala') {
            const kendalaId = Number(value);
            const wasteItem = wasteKendalaList.find(
              (w) => w.id === item.id_waste,
            );
            const kendala = wasteItem?.kendala.find((k) => k.id === kendalaId);
            return {
              ...item,
              id_kendala: kendalaId,
              kode_kendala: kendala?.kode || '',
              deskripsi_kendala: kendala?.deskripsi || '',
            };
          }

          return {
            ...item,
            [field]: value,
          };
        }),
      );
    },
    [wasteKendalaList],
  );

  // Handle Finish Submit
  const handleFinishSubmit = useCallback(async () => {
    if (!idProduksiLkh) {
      toast.error('ID Produksi LKH tidak ditemukan');
      return;
    }

    if (!idProduksiLkhTahapan) {
      toast.error('ID Produksi LKH Tahapan tidak ditemukan');
      return;
    }

    if (finishData.length === 0 && finishWasteData.length === 0) {
      toast.error('Tidak ada data proses untuk diselesaikan');
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        id_produksi_lkh_tahapan: idProduksiLkhTahapan,
        send_request_to_spv: sendRequestToSpv,
      };

      if (finishData.length > 0) {
        payload.produksi_lkh_proses = finishData.map((item) => ({
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
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          waktu_mulai: item.waktu_mulai || '',
          waktu_selesai: item.waktu_selesai || '',
        }));
      }

      if (finishWasteData.length > 0) {
        payload.produksi_lkh_waste = finishWasteData.map((item) => ({
          id: item.id,
          id_jo: item.id_jo,
          id_tahapan: item.id_tahapan,
          id_mesin: item.id_mesin,
          id_operator: item.id_operator,
          id_kendala: item.id_kendala,
          kode_kendala: item.kode_kendala,
          deskripsi_kendala: item.deskripsi_kendala,
          id_waste: item.id_waste,
          kode_waste: item.kode_waste,
          deskripsi_waste: item.deskripsi_waste,
          total_qty: item.total_qty || 0,
        }));
      }

      console.log('Finish Payload:', idProduksiLkh, payload);

      await axios.put(
        `${API_BASE}/produksi/lkh/finish/${idProduksiLkh}`,
        payload,
        {
          withCredentials: true,
        },
      );

      toast.success('Data LKH berhasil diselesaikan');
      setShowFinishModal(false);
      setFinishData([]);
      setFinishWasteData([]);
      setSendRequestToSpv(true);

      // Clear persisted selection on finish
      localStorage.removeItem('lkh_selected_jo_id');
      localStorage.removeItem('lkh_selected_tahapan_id');
      localStorage.removeItem('lkh_selected_mesin');

      // Reset form
      setSelectedJO(null);
      setSelectedTahapan(null);
      setSelectedTahapanName('');
      setSelectedMesin('');
      setIdProduksiLkh(null);
      setIdProduksiLkhTahapan(null);
      setWasteProcessData({
        id_waste: '',
        id_kendala: '',
        total_qty: 0,
      });
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
    finishWasteData,
    sendRequestToSpv,
    formData.operator,
  ]);

  // Initial Load
  useEffect(() => {
    fetchUserData();
    fetchJOList();
  }, [fetchUserData, fetchJOList]);

  // Restore persisted JO / Tahapan / Mesin selection after joList loads
  useEffect(() => {
    if (joList.length === 0) return;

    const savedJoId = localStorage.getItem('lkh_selected_jo_id');
    const savedTahapanId = localStorage.getItem('lkh_selected_tahapan_id');
    const savedMesin = localStorage.getItem('lkh_selected_mesin');

    if (!savedJoId) return;

    const jo = joList.find((j) => j.id === parseInt(savedJoId));
    if (!jo) return;

    // Restore JO
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

    // Fetch tahapan for this JO, then restore tahapan + mesin
    const restoreTahapanAndMesin = async () => {
      try {
        const tahapanRes = await axios.get(`${API_BASE}/produksi/lkhTahapan`, {
          params: { status: 'active', id_jo: jo.id },
          withCredentials: true,
        });
        const tahapanData: TahapanData[] = tahapanRes.data.data || [];
        setTahapanList(tahapanData);

        if (!savedTahapanId) return;

        const tahapanId = parseInt(savedTahapanId);
        const tahapan = tahapanData.find((t) => t.tahapan.id === tahapanId);
        if (!tahapan) return;

        setSelectedTahapan(tahapanId);
        setSelectedTahapanName(tahapan.tahapan.nama_tahapan || '');

        // Fetch mesin options for this tahapan
        const mesinRes = await axios.get(`${API_BASE}/master/tahapanMesin`, {
          params: { id_tahapan: tahapanId },
          withCredentials: true,
        });
        const mesinOpts: Option[] = mesinRes.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: String(item.id_mesin_tahapan),
            label: item.mesin.nama_mesin,
          }),
        );
        setMesinOptions(mesinOpts);

        // Fetch kode produksi and waste kendala
        await fetchKodeProduksi(tahapanId);
        await fetchWasteKendala();

        // Restore mesin
        if (savedMesin && mesinOpts.some((o) => o.value === savedMesin)) {
          setSelectedMesin(savedMesin);
        }
      } catch (err) {
        console.error('Error restoring persisted selection:', err);
      }
    };

    restoreTahapanAndMesin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joList]);

  // Fetch active processes when dependencies change
  useEffect(() => {
    if (
      selectedJO &&
      selectedTahapan &&
      userId &&
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

  // Convert data to react-select options
  const joOptions = joList.map((jo) => ({
    value: String(jo.id),
    label: `${jo.no_jo} - ${jo.produk}`,
  }));

  const tahapanOptions = tahapanList.map((tahapan) => ({
    value: String(tahapan.tahapan.id),
    label: tahapan.tahapan.nama_tahapan,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Side - Job Order Form */}
          <div className="lg:col-span-4">
            <JobOrderForm
              formData={formData}
              loading={loading}
              joOptions={joOptions}
              tahapanOptions={tahapanOptions}
              mesinOptions={mesinOptions}
              selectedJO={selectedJO}
              selectedTahapan={selectedTahapan}
              selectedMesin={selectedMesin}
              onJOSelect={handleJOSelect}
              onTahapanSelect={handleTahapanSelect}
              onMesinSelect={handleMesinSelect}
              onSpekChange={(value) =>
                setFormData((prev) => ({ ...prev, spek: value }))
              }
              onTanggalChange={(value) =>
                setFormData((prev) => ({ ...prev, tanggal: value }))
              }
            />
          </div>

          {/* Right Side - Process Control */}
          <div className="lg:col-span-8">
            <ProcessControl
              selectedTahapan={selectedTahapan}
              selectedMesin={selectedMesin}
              loading={loading}
              hasActiveProcess={hasActiveProcess()}
              isSortirProcess={isSortirProcess()}
              kodeProduksiByProcess={kodeProduksiByProcess}
              wasteKendalaList={wasteKendalaList}
              activeProcesses={activeProcesses}
              processDataList={processDataList}
              wasteProcessData={wasteProcessData}
              selectedJO={selectedJO} // ← NEW
              userId={userId} // ← NEW
              onStartProcess={handleStartProcess}
              onStopProcess={handleStopProcess}
              onProcessDataChange={handleProcessDataChange}
              onWasteProcessDataChange={handleWasteProcessDataChange}
              onWasteSubmit={handleWasteSubmit}
              onFinish={() => {
                if (hasActiveProcess()) {
                  toast.error(
                    'Harap selesaikan semua proses yang sedang berjalan',
                  );
                  return;
                }
                fetchDoneLKHProcesses();
              }}
            />
          </div>
        </div>
      </div>

      {/* Finish Modal */}
      <FinishLKHModal
        show={showFinishModal}
        loading={loading}
        finishData={finishData}
        finishWasteData={finishWasteData}
        wasteKendalaList={wasteKendalaList}
        onClose={() => {
          setShowFinishModal(false);
          setFinishData([]);
          setFinishWasteData([]);
          setSendRequestToSpv(true);
        }}
        onSubmit={handleFinishSubmit}
        onDataChange={handleFinishDataChange}
        onWasteDataChange={handleFinishWasteDataChange}
      />

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
