// JOPPICCreateModal.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  JOFormData,
  JOTipeOption,
  MountingData,
  SOData,
} from '../types/jo.types';
import {
  BasicInfoSection,
  InsheetCalculationSection,
  MountingSection,
  ProductionDetailsSection,
} from './JOPPICFormSections';

interface JOPPICCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipeJO: JOTipeOption;
  editMode?: boolean;
  editJOId?: number | null;
}

const JOPPICCreateModal: React.FC<JOPPICCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipeJO,
  editMode = false,
  editJOId = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMounting, setLoadingMounting] = useState(false);
  const [soData, setSOData] = useState<SOData[]>([]);
  const [mountingData, setMountingData] = useState<MountingData[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<number | null>(null);
  const [jumlahJO, setJumlahJO] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ADD THIS NEW STATE
  const [isManualInsheetEdit, setIsManualInsheetEdit] = useState(false);

  // ✅ ADD THESE NEW STATES FOR EDIT MODE CONTROL
  const [isInitialEditLoad, setIsInitialEditLoad] = useState(false);
  const [originalQty, setOriginalQty] = useState<number>(0);
  const [hasQtyBeenEdited, setHasQtyBeenEdited] = useState(false);

  const initialFormData: Partial<JOFormData> = {
    id_io: 0,
    id_so: 0,
    id_customer: 0,
    id_produk: 0,
    no_jo: '',
    no_io: '',
    no_so: '',
    customer: '',
    status_produk: '',
    no_po_customer: '',
    produk: '',
    status_kalkulasi: '',
    status_jo: '',
    stok_fg: 0,
    qty: 0,
    qty_druk: 0,
    qty_lp: 0,
    po_qty: 0,
    spesifikasi: '',
    keterangan_pengerjaan: '',
    toleransi: '',
    alamat_pengiriman: '',
    tgl_kirim: new Date().toISOString().split('T')[0],
    standar_warna: '',
    tipe_jo: tipeJO,
    jo_mounting: [],
  };

  const [formData, setFormData] =
    useState<Partial<JOFormData>>(initialFormData);
  const [ketentuanInsheetData, setKetentuanInsheetData] = useState<any[]>([]);
  const [prosesInsheetData, setProsesInsheetData] = useState<any[]>([]);
  const [insheetValues, setInsheetValues] = useState<{
    jumlah_druk: number;
    jumlah_insheet_cetak: number;
    jumlah_insheet_pond: number;
    jumlah_insheet_finishing: number;
    total_insheet: number;
    jumlah_lp: number;
  }>({
    jumlah_druk: 0,
    jumlah_insheet_cetak: 0,
    jumlah_insheet_pond: 0,
    jumlah_insheet_finishing: 0,
    total_insheet: 0,
    jumlah_lp: 0,
  });

  // ✅ MODIFIED: Auto-calculate qty when stok_fg or po_qty changes
  useEffect(() => {
    // Skip entirely in edit mode during initial load or if qty hasn't been edited
    if (editMode && (!hasQtyBeenEdited || isInitialEditLoad)) return;

    // Skip in create mode during initial load
    if (!editMode && isInitialEditLoad) return;

    const calculatedQty = Math.max(
      0,
      (formData.po_qty || 0) - (formData.stok_fg || 0),
    );
    if (calculatedQty !== formData.qty) {
      setFormData((prev) => ({
        ...prev,
        qty: calculatedQty,
      }));
    }
  }, [formData.po_qty, formData.stok_fg]);

  // ✅ MODIFIED: Auto-calculate insheet
  useEffect(() => {
    // Skip entirely in edit mode during initial load or if qty hasn't been edited
    if (editMode && (!hasQtyBeenEdited || isInitialEditLoad)) return;

    // Skip in create mode during initial load
    if (!editMode && isInitialEditLoad) return;

    // Skip if manually editing insheet
    if (isManualInsheetEdit) return;

    // Only auto-calculate if we have the necessary data
    if (selectedMounting && formData.qty) {
      const mounting = mountingData.find((m) => m.id === selectedMounting);
      if (mounting) {
        calculateInsheetFromQty(formData.qty, mounting);
      }
    }
  }, [formData.qty, selectedMounting]);

  useEffect(() => {
    if (isManualInsheetEdit) {
      const timer = setTimeout(() => {
        setIsManualInsheetEdit(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isManualInsheetEdit]);

  useEffect(() => {
    if (formData.id_so || selectedMounting) {
      setHasUnsavedChanges(true);
    }
  }, [formData.id_so, selectedMounting]);

  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, hasUnsavedChanges]);

  const calculateInsheetFromQty = (qty: number, mounting: MountingData) => {
    const isi = mounting.ukuran_cetak_isi_1 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;

    // Step 1: Calculate RAW Jumlah Druk (base, without insheet)
    const rawJumlahDruk = Math.ceil(qty / isi);

    // Step 2: Get Ketentuan Insheet BASED ON RAW DRUK (not qty)
    const ketentuanInsheet = getKetentuanInsheet(rawJumlahDruk);
    const ketentuanValue =
      typeof ketentuanInsheet === 'object'
        ? ketentuanInsheet.is_persentase
          ? (rawJumlahDruk * ketentuanInsheet.nilai) / 100
          : ketentuanInsheet.nilai
        : ketentuanInsheet;

    // Step 3: Calculate Total Insheet
    const totalInsheet = Math.ceil(ketentuanValue);

    // Step 4: Distribute to processes
    const totalPercentage = prosesInsheetData.reduce(
      (sum, p) => sum + p.persentase_insheet,
      0,
    );

    let cetak = 0,
      pond = 0,
      finishing = 0;

    prosesInsheetData.forEach((proses) => {
      const value = Math.ceil(
        (totalInsheet * proses.persentase_insheet) / totalPercentage,
      );
      const prosesName = proses.proses.toUpperCase();

      if (prosesName === 'CETAK') cetak = value;
      else if (
        prosesName === 'POND' ||
        prosesName === 'PONDS' ||
        prosesName === 'PONDING'
      )
        pond = value;
      else if (prosesName === 'FINISHING') finishing = value;
    });

    // Step 5: Calculate displayed druk and LP
    const displayedDruk = rawJumlahDruk + totalInsheet;
    const jumlahLP = Math.ceil(displayedDruk / bagian);

    // UPDATE FORM DATA WITH NEW FIELDS
    setFormData((prev) => ({
      ...prev,
      qty_druk: displayedDruk,
      qty_lp: jumlahLP,
    }));

    setInsheetValues({
      jumlah_druk: rawJumlahDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalInsheet,
      jumlah_lp: jumlahLP,
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchSOData();
      fetchJumlahJO();
      fetchKetentuanInsheet();
      fetchProsesInsheet();
    }
  }, [isOpen]);

  useEffect(() => {
    generateJONumber();
  }, [jumlahJO]);

  const fetchSOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: { is_jo_done: false },
        withCredentials: true,
      });
      console.log('SO data response:', res.data);
      setSOData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching SO data:', error);
      setSOData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateJONumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const nextNumber = String(jumlahJO + 1).padStart(5, '0');
    const joNumber = `JO-${nextNumber}/${month}/${year}`;

    setFormData((prev) => ({
      ...prev,
      no_jo: joNumber,
    }));
  };

  const fetchJumlahJO = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/joJumlahData`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Jumlah JO response:', res.data);
      const totalData = res.data.total_data ?? 0;
      setJumlahJO(totalData);

      // Generate JO number immediately after setting jumlahJO
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const nextNumber = String(totalData + 1).padStart(5, '0');
      const joNumber = `JO-${nextNumber}/${month}/${year}`;

      setFormData((prev) => ({
        ...prev,
        no_jo: joNumber,
      }));
    } catch (error) {
      console.error('Error fetching jumlah JO:', error);
      setJumlahJO(0);

      // Even on error, generate JO-00001
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const joNumber = `JO-00001/${month}/${year}`;

      setFormData((prev) => ({
        ...prev,
        no_jo: joNumber,
      }));
    }
  };

  const fetchMountingData = async (idIO: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`;
    try {
      setLoadingMounting(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Mounting data response:', res.data);
      if (res.data.data && res.data.data.io_mounting) {
        const mountings = res.data.data.io_mounting || [];
        setMountingData(mountings);
        setSelectedMounting(null);
        setInsheetValues({
          jumlah_druk: 0,
          jumlah_insheet_cetak: 0,
          jumlah_insheet_pond: 0,
          jumlah_insheet_finishing: 0,
          total_insheet: 0,
          jumlah_lp: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching mounting data:', error);
      setMountingData([]);
      setSelectedMounting(null);
    } finally {
      setLoadingMounting(false);
    }
  };

  const fetchCustomerData = async (idCus: number): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/marketing/customer/${idCus}`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      if (res.data.data) {
        const customer = res.data.data || {};
        setFormData((prev) => ({
          ...prev,
          id_customer: customer.id || 0,
          toleransi: customer.toleransi_pengiriman || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const fetchKetentuanInsheet = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/ketentuanInsheet`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setKetentuanInsheetData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching ketentuan insheet:', error);
      setKetentuanInsheetData([]);
    }
  };

  const fetchProsesInsheet = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/master/prosesInsheet`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setProsesInsheetData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching proses insheet:', error);
      setProsesInsheetData([]);
    }
  };

  // ✅ NEW FUNCTION: Fetch IO Mounting with Tahapan
  const fetchIOMountingWithTahapan = async (
    idIO: number,
  ): Promise<MountingData[]> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      console.log('IO Mounting with Tahapan response:', res.data);
      if (res.data.data && res.data.data.io_mounting) {
        return res.data.data.io_mounting || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching IO mounting with tahapan:', error);
      return [];
    }
  };

  // ✅ MODIFIED: fetchJODetail
  const fetchJODetail = async (joId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${joId}`;
    try {
      setLoading(true);
      // ✅ SET FLAG TO PREVENT AUTO-CALCULATION
      setIsInitialEditLoad(true);

      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data.data) {
        const joDetail = res.data.data;

        // ✅ STORE ORIGINAL QTY
        setOriginalQty(joDetail.qty || 0);

        setFormData({
          id_io: joDetail.id_io,
          id_jo: joDetail.id,
          id_so: joDetail.id_so,
          id_customer: joDetail.id_customer,
          id_produk: joDetail.id_produk,
          no_jo: joDetail.no_jo,
          no_io: joDetail.no_io,
          no_so: joDetail.no_so,
          customer: joDetail.customer,
          produk: joDetail.produk,
          status_kalkulasi: joDetail.status_kalkulasi,
          status_jo: joDetail.status_jo,
          status_produk: joDetail.status_produk, // Add this if missing
          stok_fg: joDetail.stok_fg || 0,
          qty: joDetail.qty || 0,
          qty_druk: joDetail.qty_druk || 0,
          qty_lp: joDetail.qty_lp || 0,
          po_qty: joDetail.po_qty || 0,
          spesifikasi: joDetail.spesifikasi || '',
          keterangan_pengerjaan: joDetail.keterangan_pengerjaan || '',
          toleransi: joDetail.toleransi || '',
          alamat_pengiriman: joDetail.alamat_pengiriman || '',
          tgl_kirim: joDetail.tgl_kirim
            ? joDetail.tgl_kirim.split('T')[0]
            : new Date().toISOString().split('T')[0],
          standar_warna: joDetail.standar_warna || '',
          tipe_jo: joDetail.tipe_jo,
          // ✅ ADD no_po_customer from SO object
          no_po_customer:
            joDetail.so?.no_po_customer || joDetail.no_po_customer || '',
          jo_mounting: joDetail.jo_mounting || [],
        });

        // ✅ FETCH IO_MOUNTING TO GET TAHAPAN DATA
        if (joDetail.id_io) {
          const ioMountingData = await fetchIOMountingWithTahapan(
            joDetail.id_io,
          );

          if (
            ioMountingData.length > 0 &&
            joDetail.jo_mounting &&
            joDetail.jo_mounting.length > 0
          ) {
            // Merge tahapan from io_mounting into jo_mounting data
            const mountingsWithTahapan = joDetail.jo_mounting.map((jm: any) => {
              // Find corresponding io_mounting to get tahapan
              const ioMounting = ioMountingData.find(
                (io: any) => io.id === jm.id_io_mounting,
              );

              return {
                id: jm.id_io_mounting,
                id_io: joDetail.id_io,
                nama_mounting: jm.nama_mounting || '',
                id_kertas: jm.id_kertas,
                nama_kertas: jm.nama_kertas,
                gramature_kertas: jm.gramature_kertas,
                panjang_plano: jm.panjang_kertas,
                lebar_plano: jm.lebar_kertas,
                ukuran_cetak_panjang_1: jm.ukuran_cetak_panjang_1,
                ukuran_cetak_lebar_1: jm.ukuran_cetak_lebar_1,
                ukuran_cetak_bagian_1: jm.ukuran_cetak_bagian_1,
                ukuran_cetak_isi_1: jm.ukuran_cetak_isi_1,
                ukuran_cetak_panjang_2: jm.ukuran_cetak_panjang_2 || 0,
                ukuran_cetak_lebar_2: jm.ukuran_cetak_lebar_2 || 0,
                ukuran_cetak_bagian_2: jm.ukuran_cetak_bagian_2 || 0,
                ukuran_cetak_isi_2: jm.ukuran_cetak_isi_2 || 0,
                warna_depan: ioMounting?.warna_depan || 0,
                warna_belakang: ioMounting?.warna_belakang || 0,
                nama_coating_depan: ioMounting?.nama_coating_depan || '',
                nama_coating_belakang: ioMounting?.nama_coating_belakang || '',
                jenis_kertas: ioMounting?.jenis_kertas || '',
                jumlah_warna: ioMounting?.jumlah_warna || '',
                format_data: ioMounting?.format_data || '',
                nama_jenis_pons: ioMounting?.nama_jenis_pons || '',
                nama_lem: ioMounting?.nama_lem || '',
                // ✅ INCLUDE TAHAPAN FROM IO_MOUNTING
                tahapan: ioMounting?.tahapan || [],
              };
            });

            setMountingData(mountingsWithTahapan);

            // Find and set the selected mounting
            const selectedJoMounting = joDetail.jo_mounting.find(
              (jm: any) => jm.is_selected,
            );

            if (selectedJoMounting) {
              setSelectedMounting(selectedJoMounting.id_io_mounting);

              // ✅ USE DIRECT VALUES FROM API WITHOUT RECALCULATION
              setInsheetValues({
                jumlah_druk:
                  selectedJoMounting.jumlah_druk_cetak -
                    selectedJoMounting.total_insheet || 0,
                jumlah_insheet_cetak:
                  selectedJoMounting.jumlah_insheet_cetak || 0,
                jumlah_insheet_pond:
                  selectedJoMounting.jumlah_insheet_pond || 0,
                jumlah_insheet_finishing:
                  selectedJoMounting.jumlah_insheet_finishing || 0,
                total_insheet: selectedJoMounting.total_insheet || 0,
                jumlah_lp: selectedJoMounting.jumlah_kertas || 0,
              });
            }
          }
        }

        // Still fetch customer data for toleransi
        if (joDetail.id_customer) {
          await fetchCustomerData(joDetail.id_customer);
        }

        // ✅ AFTER ALL DATA IS LOADED, RELEASE THE FLAG
        // Use a small timeout to ensure all state updates are complete
        setTimeout(() => {
          setIsInitialEditLoad(false);
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching JO detail:', error);
      alert('Gagal mengambil data JO');
      setIsInitialEditLoad(false);
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      ...initialFormData,
      tipe_jo: tipeJO,
    });
    setSelectedMounting(null);
    setMountingData([]);
    setInsheetValues({
      jumlah_druk: 0,
      jumlah_insheet_cetak: 0,
      jumlah_insheet_pond: 0,
      jumlah_insheet_finishing: 0,
      total_insheet: 0,
      jumlah_lp: 0,
    });
    setHasUnsavedChanges(false);
    // ✅ RESET NEW STATES
    setIsInitialEditLoad(false);
    setOriginalQty(0);
    setHasQtyBeenEdited(false);
  };

  useEffect(() => {
    if (isOpen && editMode && editJOId) {
      fetchJODetail(editJOId);
    } else if (isOpen && !editMode) {
      resetForm();
    }
  }, [isOpen, editMode, editJOId]);

  const getKetentuanInsheet = (rawDruk: number): any => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return rawDruk >= batasBawah && rawDruk <= batasAtas;
    });

    return ketentuan || { nilai: 0, is_persentase: false };
  };

  const generateSpesifikasi = (mounting: MountingData): string => {
    const warnaDepan = mounting.warna_depan || 0;
    const warnaBelakang = mounting.warna_belakang || 0;
    const coatingDepan = mounting.nama_coating_depan ? 1 : 0;
    const coatingBelakang = mounting.nama_coating_belakang ? 1 : 0;

    const coatingNames = [
      mounting.nama_coating_depan,
      mounting.nama_coating_belakang,
    ]
      .filter(Boolean)
      .join(' + ');

    return `${warnaDepan}/${warnaBelakang} + ${coatingDepan}/${coatingBelakang} ${coatingNames}`.trim();
  };

  const handleSOChange = (soId: number) => {
    const selectedSO = soData.find((so) => so.id === soId);

    if (selectedSO) {
      setFormData((prev) => ({
        ...prev,
        id_so: selectedSO.id,
        id_io: selectedSO.id_io,
        id_customer: selectedSO.id_customer,
        id_produk: 0,
        no_so: selectedSO.no_so,
        no_io: selectedSO.no_io,
        customer: selectedSO.customer,
        produk: selectedSO.produk,
        po_qty: selectedSO.po_qty,
        no_po_customer: selectedSO.no_po_customer,
        alamat_pengiriman: selectedSO.alamat_pengiriman || '',
        standar_warna: selectedSO.ada_standar_warna || '',
        status_produk: selectedSO.status_produk || '',
        status_jo: selectedSO.status_jo || '-',
      }));

      // Only fetch mounting data if not in edit mode
      if (!editMode) {
        fetchMountingData(selectedSO.id_io);
      }

      fetchCustomerData(selectedSO.id_customer);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMountingSelect = (mountingId: number) => {
    if (selectedMounting === mountingId) {
      setSelectedMounting(null);
      setFormData((prev) => ({
        ...prev,
        spesifikasi: '',
        qty_druk: 0,
        qty_lp: 0,
      }));
      setInsheetValues({
        jumlah_druk: 0,
        jumlah_insheet_cetak: 0,
        jumlah_insheet_pond: 0,
        jumlah_insheet_finishing: 0,
        total_insheet: 0,
        jumlah_lp: 0,
      });
    } else {
      setSelectedMounting(mountingId);
      const mounting = mountingData.find((m) => m.id === mountingId);
      if (mounting) {
        const spesifikasi = generateSpesifikasi(mounting);
        setFormData((prev) => ({ ...prev, spesifikasi }));

        // ✅ Only recalculate if not in edit mode or if qty has been edited
        if (!editMode && formData.qty) {
          calculateInsheetFromQty(formData.qty, mounting);
        }
      }
    }
  };

  const handleTotalInsheetChange = (totalValue: number) => {
    if (!selectedMounting) return;

    // SET FLAG to prevent auto-recalculation
    setIsManualInsheetEdit(true);

    const mounting = mountingData.find((m) => m.id === selectedMounting);
    if (!mounting) return;

    const isi = mounting.ukuran_cetak_isi_1 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;

    const totalPercentage = prosesInsheetData.reduce(
      (sum, p) => sum + p.persentase_insheet,
      0,
    );

    let cetak = 0,
      pond = 0,
      finishing = 0;

    prosesInsheetData.forEach((proses) => {
      const value = Math.ceil(
        (totalValue * proses.persentase_insheet) / totalPercentage,
      );
      const prosesName = proses.proses.toUpperCase();

      if (prosesName === 'CETAK') cetak = value;
      else if (
        prosesName === 'POND' ||
        prosesName === 'PONDS' ||
        prosesName === 'PONDING'
      )
        pond = value;
      else if (prosesName === 'FINISHING') finishing = value;
    });

    const currentRawDruk = insheetValues.jumlah_druk;
    const displayedDruk = currentRawDruk + totalValue;
    const calculatedQty = displayedDruk * isi;
    const jumlahLP = Math.ceil(displayedDruk / bagian);

    // UPDATE FORM DATA WITH NEW FIELDS
    setFormData((prev) => ({
      ...prev,
      qty: calculatedQty,
      qty_druk: displayedDruk,
      qty_lp: jumlahLP,
    }));

    setInsheetValues({
      jumlah_druk: currentRawDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalValue,
      jumlah_lp: jumlahLP,
    });

    // ✅ Mark that qty has been edited (when insheet changes, qty changes)
    if (editMode) {
      setHasQtyBeenEdited(true);
    }
  };

  // ✅ MODIFIED: handleQtyChange
  const handleQtyChange = (newQty: number) => {
    // ✅ Mark that qty has been edited if value changed from original
    if (editMode && newQty !== originalQty) {
      setHasQtyBeenEdited(true);
    }
    setFormData((prev) => ({ ...prev, qty: newQty }));

    if (!selectedMounting) {
      return;
    }

    const mounting = mountingData.find((m) => m.id === selectedMounting);
    if (mounting) {
      // Only recalculate if qty has been edited or not in edit mode
      if (!editMode || hasQtyBeenEdited || newQty !== originalQty) {
        calculateInsheetFromQty(newQty, mounting);
      }
    }
  };
  const handleSubmit = async () => {
    if (!formData.id_so) {
      alert('Pilih SO terlebih dahulu');
      return;
    }
    if (!selectedMounting) {
      alert('Pilih mounting terlebih dahulu');
      return;
    }

    const displayedJumlahDruk =
      insheetValues.jumlah_druk + insheetValues.total_insheet;

    // Create jo_mounting data for ALL mountings
    const joMountingData = mountingData.map((mounting) => {
      const isSelected = mounting.id === selectedMounting;

      // Find the original jo_mounting record if in edit mode
      const originalJOMount =
        editMode && formData.jo_mounting
          ? formData.jo_mounting.find(
              (jm: any) => jm.id_io_mounting === mounting.id,
            )
          : null;

      if (isSelected) {
        return {
          id: originalJOMount?.id,
          id_jo: formData.id_jo,
          id_io_mounting: mounting.id,
          id_kertas: mounting.id_kertas,
          nama_kertas: mounting.nama_kertas,
          nama_mounting: mounting.nama_mounting,
          gramature_kertas: mounting.gramature_kertas,
          panjang_kertas: mounting.panjang_plano,
          lebar_kertas: mounting.lebar_plano,
          jumlah_kertas: insheetValues.jumlah_lp,
          ukuran_cetak_panjang_1: mounting.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: mounting.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: mounting.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: mounting.ukuran_cetak_isi_1,
          jumlah_cetak_1: 0,
          tambahan_insheet_1: 0,
          ukuran_cetak_panjang_2: mounting.ukuran_cetak_panjang_2 || 0,
          ukuran_cetak_lebar_2: mounting.ukuran_cetak_lebar_2 || 0,
          ukuran_cetak_bagian_2: mounting.ukuran_cetak_bagian_2 || 0,
          ukuran_cetak_isi_2: mounting.ukuran_cetak_isi_2 || 0,
          jumlah_cetak_2: 0,
          tambahan_insheet_2: 0,
          jumlah_druk_cetak: displayedJumlahDruk,
          jumlah_insheet_cetak: insheetValues.jumlah_insheet_cetak,
          jumlah_druk_pond: displayedJumlahDruk,
          jumlah_insheet_pond: insheetValues.jumlah_insheet_pond,
          jumlah_druk_finishing: displayedJumlahDruk,
          jumlah_insheet_finishing: insheetValues.jumlah_insheet_finishing,
          total_insheet: insheetValues.total_insheet,
          is_selected: true,
        };
      } else {
        return {
          id: originalJOMount?.id,
          id_jo: formData.id_jo,
          id_io_mounting: mounting.id,
          nama_mounting: mounting.nama_mounting,
          id_kertas: mounting.id_kertas,
          nama_kertas: mounting.nama_kertas,
          gramature_kertas: mounting.gramature_kertas,
          panjang_kertas: mounting.panjang_plano,
          lebar_kertas: mounting.lebar_plano,
          jumlah_kertas: 0,
          ukuran_cetak_panjang_1: mounting.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: mounting.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: mounting.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: mounting.ukuran_cetak_isi_1,
          jumlah_cetak_1: 0,
          tambahan_insheet_1: 0,
          ukuran_cetak_panjang_2: mounting.ukuran_cetak_panjang_2 || 0,
          ukuran_cetak_lebar_2: mounting.ukuran_cetak_lebar_2 || 0,
          ukuran_cetak_bagian_2: mounting.ukuran_cetak_bagian_2 || 0,
          ukuran_cetak_isi_2: mounting.ukuran_cetak_isi_2 || 0,
          jumlah_cetak_2: 0,
          tambahan_insheet_2: 0,
          jumlah_druk_cetak: 0,
          jumlah_insheet_cetak: 0,
          jumlah_druk_pond: 0,
          jumlah_insheet_pond: 0,
          jumlah_druk_finishing: 0,
          jumlah_insheet_finishing: 0,
          total_insheet: 0,
          is_selected: false,
        };
      }
    });

    const submitData = {
      ...formData,
      jo_mounting: joMountingData,
    };
    try {
      setLoading(true);
      console.log('Submitting JO data:', submitData);
      if (editMode && editJOId) {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${editJOId}`;
        const res: AxiosResponse = await axios.put(url, submitData, {
          withCredentials: true,
        });
        if (res.data.success || res.data.succes) {
          alert('JO berhasil diupdate');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
        console.log('Edit JO submit data:', submitData);
      } else {
        const url = `${import.meta.env.VITE_API_LINK}/ppic/jo`;
        const res: AxiosResponse = await axios.post(url, submitData, {
          withCredentials: true,
        });
        if (res.data.success || res.data.succes) {
          alert('JO berhasil dibuat');
          setHasUnsavedChanges(false);
          onSuccess();
          onClose();
        }
        console.log('Create JO submit data:', submitData);
      }
    } catch (error: any) {
      console.error('Error saving JO:', error);
      const errorMessage = error.response?.data?.msg || 'Gagal menyimpan JO';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup form ini?',
      );
      if (confirmClose) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };
  const selectedMountingData = selectedMounting
    ? mountingData.find((m) => m.id === selectedMounting)
    : null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center w-full h-full px-4 py-4">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />
        {/* TWO COLUMN LAYOUT */}
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white">
                {editMode ? `Edit ${tipeJO}` : `Tambah ${tipeJO}`}
              </h2>
              {/* ADD THIS STATUS PRODUK BADGE */}
              {formData.status_produk && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-white opacity-90">
                    Status Produk:
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      formData.status_produk?.toLowerCase() === 'acc'
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-400 text-gray-800'
                    }`}
                  >
                    {formData.status_produk}
                  </span>
                  {formData.status_produk?.toLowerCase() !== 'acc' && (
                    <span className="text-xs text-yellow-200">
                      ⚠ Product not yet accepted
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
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
          {/* Body - Two Column Layout */}
          <div className="flex-1 overflow-hidden flex">
            {/* LEFT COLUMN - Basic Info & Production Details */}
            <div className="w-1/3 border-r overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-6">
                <BasicInfoSection
                  formData={formData}
                  soData={soData}
                  onSOChange={handleSOChange}
                  loadingMounting={loadingMounting}
                  editMode={editMode}
                />

                <ProductionDetailsSection
                  formData={formData}
                  onChange={handleFieldChange}
                  onQtyChange={handleQtyChange}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Mounting Selection & Insheet Calculation */}
            <div className="w-2/3 overflow-y-auto p-6">
              <div className="space-y-6">
                <MountingSection
                  mountingData={mountingData}
                  selectedMounting={selectedMounting}
                  onMountingSelect={handleMountingSelect}
                  loadingMounting={loadingMounting}
                  insheetValues={insheetValues}
                />

                {selectedMountingData && (
                  <InsheetCalculationSection
                    mounting={selectedMountingData}
                    qty={formData.qty || 0}
                    ketentuanInsheetData={ketentuanInsheetData}
                    prosesInsheetData={prosesInsheetData}
                    insheetValues={insheetValues}
                    onTotalInsheetChange={handleTotalInsheetChange}
                  />
                )}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedMounting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Menyimpan...' : editMode ? 'Update JO' : 'Simpan JO'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
export default JOPPICCreateModal;
