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

// Extend MountingData to include the JO mounting reference
interface ExtendedMountingData extends MountingData {
  _joMountingRef?: any;
}

// NEW: IO data shape returned by /marketing/ioSendProofJo
interface IOProofData {
  id: number;
  no_io: string;
  id_io: number;
  customer: string;
  produk: string;
  id_customer: number;
  id_produk: number;
  tgl_pengiriman?: string;
  alamat_pengiriman?: string;
  ada_standar_warna?: string;
  status_produk?: string;
  io_mounting?: Array<{ tahapan: TahapanItem[] }>;
}

interface TahapanItem {
  id: number;
  id_drying_time: number | null;
  id_setting_kapasitas: number | null;
  nama_mesin: string;
  nama_proses: string;
}

interface JOPPICCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipeJO: JOTipeOption;
  editMode?: boolean;
  editJOId?: number | null;
  // NEW: 'SO' | 'IO' — only relevant when tipeJO === 'JO PROOF'
  proofSourceType?: 'SO' | 'IO';
}

// ── Helper: compute block reasons from a list of tahapan arrays ──────────────
const getCreateBlockReasons = (allTahapan: TahapanItem[]): string[] => {
  const reasons: string[] = [];
  if (allTahapan.length === 0) {
    reasons.push('Tahapan belum diset');
  } else {
    if (allTahapan.some((t) => t.id_drying_time === null)) {
      reasons.push('Drying time belum diset pada tahapan');
    }
    if (allTahapan.some((t) => t.id_setting_kapasitas === null)) {
      reasons.push('Kapasitas belum diset pada tahapan');
    }
  }
  return reasons;
};

const JOPPICCreateModal: React.FC<JOPPICCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipeJO,
  editMode = false,
  editJOId = null,
  proofSourceType = 'SO',
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMounting, setLoadingMounting] = useState(false);
  const [soData, setSOData] = useState<SOData[]>([]);
  // NEW: IO proof list
  const [ioProofData, setIOProofData] = useState<IOProofData[]>([]);
  const [mountingData, setMountingData] = useState<ExtendedMountingData[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<number | null>(null);
  const [jumlahJO, setJumlahJO] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isManualInsheetEdit, setIsManualInsheetEdit] = useState(false);

  const [isInitialEditLoad, setIsInitialEditLoad] = useState(false);
  const [originalQty, setOriginalQty] = useState<number>(0);
  const [hasQtyBeenEdited, setHasQtyBeenEdited] = useState(false);

  // NEW: block reasons for create JO
  const [createBlockReasons, setCreateBlockReasons] = useState<string[]>([]);

  // Determine if this modal is in "IO proof" mode
  const isIOProofMode =
    tipeJO === 'JO PROOF' && proofSourceType === 'IO' && !editMode;

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

  // ── Auto-calculate qty ────────────────────────────────────────────────────
  useEffect(() => {
    if (editMode && (!hasQtyBeenEdited || isInitialEditLoad)) return;
    if (!editMode && isInitialEditLoad) return;

    const calculatedQty = Math.max(
      0,
      (formData.po_qty || 0) - (formData.stok_fg || 0),
    );
    if (calculatedQty !== formData.qty) {
      setFormData((prev) => ({ ...prev, qty: calculatedQty }));
    }
  }, [formData.po_qty, formData.stok_fg]);

  // ── Auto-calculate insheet ────────────────────────────────────────────────
  useEffect(() => {
    if (editMode && (!hasQtyBeenEdited || isInitialEditLoad)) return;
    if (!editMode && isInitialEditLoad) return;
    if (isManualInsheetEdit) return;

    if (selectedMounting && formData.qty) {
      const mounting = mountingData.find((m) => m.id === selectedMounting);
      if (mounting) {
        calculateInsheetFromQty(formData.qty, mounting);
      }
    }
  }, [formData.qty, selectedMounting]);

  useEffect(() => {
    if (isManualInsheetEdit) {
      const timer = setTimeout(() => setIsManualInsheetEdit(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isManualInsheetEdit]);

  useEffect(() => {
    if (formData.id_so || formData.id_io || selectedMounting) {
      setHasUnsavedChanges(true);
    }
  }, [formData.id_so, formData.id_io, selectedMounting]);

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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, hasUnsavedChanges]);

  // ── calculateInsheetFromQty ───────────────────────────────────────────────
  const calculateInsheetFromQty = (qty: number, mounting: MountingData) => {
    const isi = mounting.ukuran_cetak_isi_1 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;

    const rawJumlahDruk = Math.ceil(qty / isi);
    const ketentuanInsheet = getKetentuanInsheet(rawJumlahDruk);
    const ketentuanValue =
      typeof ketentuanInsheet === 'object'
        ? ketentuanInsheet.is_persentase
          ? (rawJumlahDruk * ketentuanInsheet.nilai) / 100
          : ketentuanInsheet.nilai
        : ketentuanInsheet;

    const totalInsheet = Math.ceil(ketentuanValue);
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

    const displayedDruk = rawJumlahDruk + totalInsheet;
    const jumlahLP = Math.ceil(displayedDruk / bagian);

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

  // ── Fetch on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      fetchKetentuanInsheet();
      fetchProsesInsheet();
      fetchJumlahJO();

      if (isIOProofMode) {
        fetchIOProofData();
      } else {
        fetchSOData();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    generateJONumber();
  }, [jumlahJO]);

  // ── Fetch SO data ─────────────────────────────────────────────────────────
  const fetchSOData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/so`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        params: {
          is_jo_done: false,
          ...(tipeJO === 'JO PROOF' && { status_produk: 'proof' }),
        },
        withCredentials: true,
      });
      setSOData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching SO data:', error);
      setSOData([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch IO proof list
  const fetchIOProofData = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/ioSendProofJo`;
    try {
      setLoading(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      setIOProofData(res.data.data || []);
    } catch (error) {
      console.error('Error fetching IO proof data:', error);
      setIOProofData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Generate JO number ────────────────────────────────────────────────────
  const generateJONumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const nextNumber = String(jumlahJO + 1).padStart(5, '0');
    const suffix = tipeJO === 'JO PROOF' ? '-P' : '';
    setFormData((prev) => ({
      ...prev,
      no_jo: `JO-${nextNumber}/${month}/${year}${suffix}`,
    }));
  };

  const fetchJumlahJO = async (): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/joJumlahData`;
    try {
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      const totalData =
        tipeJO === 'JO PROOF'
          ? res.data.total_data_proof ?? 0
          : res.data.total_data ?? 0;
      setJumlahJO(totalData);

      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const nextNumber = String(totalData + 1).padStart(5, '0');
      const suffix = tipeJO === 'JO PROOF' ? '-P' : '';
      setFormData((prev) => ({
        ...prev,
        no_jo: `JO-${nextNumber}/${month}/${year}${suffix}`,
      }));
    } catch (error) {
      console.error('Error fetching jumlah JO:', error);
      setJumlahJO(0);
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const suffix = tipeJO === 'JO PROOF' ? '-P' : '';
      setFormData((prev) => ({
        ...prev,
        no_jo: `JO-00001/${month}/${year}${suffix}`,
      }));
    }
  };

  // ── Fetch mounting ────────────────────────────────────────────────────────
  const fetchMountingData = async (idIO: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`;
    try {
      setLoadingMounting(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });
      if (res.data.data && res.data.data.io_mounting) {
        setMountingData(res.data.data.io_mounting || []);
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
        const customer = res.data.data;
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
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/ketentuanInsheet`,
        { withCredentials: true },
      );
      setKetentuanInsheetData(res.data.data || []);
    } catch (error) {
      setKetentuanInsheetData([]);
    }
  };

  const fetchProsesInsheet = async (): Promise<void> => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/prosesInsheet`,
        { withCredentials: true },
      );
      setProsesInsheetData(res.data.data || []);
    } catch (error) {
      setProsesInsheetData([]);
    }
  };

  const fetchIOMountingWithTahapan = async (
    idIO: number,
  ): Promise<MountingData[]> => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`,
        { withCredentials: true },
      );
      if (res.data.data?.io_mounting) return res.data.data.io_mounting || [];
      return [];
    } catch (error) {
      return [];
    }
  };

  // ── fetchJODetail (edit mode) ─────────────────────────────────────────────
  const fetchJODetail = async (joId: number): Promise<void> => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jo/${joId}`;
    try {
      setLoading(true);
      setIsInitialEditLoad(true);
      const res: AxiosResponse = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data.data) {
        const joDetail = res.data.data;
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
          status_produk: joDetail.status_produk,
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
          no_po_customer:
            joDetail.so?.no_po_customer || joDetail.no_po_customer || '',
          jo_mounting: joDetail.jo_mounting || [],
        });

        if (joDetail.id_io) {
          const ioMountingData = await fetchIOMountingWithTahapan(
            joDetail.id_io,
          );
          if (ioMountingData.length > 0) {
            const joMountingMap = new Map();
            if (joDetail.jo_mounting?.length > 0) {
              joDetail.jo_mounting.forEach((jm: any) =>
                joMountingMap.set(jm.id_io_mounting, jm),
              );
            }

            const mergedMountings = ioMountingData.map((ioMounting: any) => {
              const existingJoMounting = joMountingMap.get(ioMounting.id);
              return {
                id: ioMounting.id,
                id_io: joDetail.id_io,
                spesifikasi: ioMounting.spesifikasi || '',
                nama_mounting: ioMounting.nama_mounting || '',
                barcode: ioMounting.barcode || '',
                format_data: ioMounting.format_data || '',
                ukuran_jadi_panjang: ioMounting.ukuran_jadi_panjang || 0,
                ukuran_jadi_lebar: ioMounting.ukuran_jadi_lebar || 0,
                ukuran_jadi_tinggi: ioMounting.ukuran_jadi_tinggi || 0,
                ukuran_jadi_terb_panjang:
                  ioMounting.ukuran_jadi_terb_panjang || 0,
                ukuran_jadi_terb_lebar: ioMounting.ukuran_jadi_terb_lebar || 0,
                jenis_kertas: ioMounting.jenis_kertas || '',
                gramature_kertas: ioMounting.gramature_kertas || 0,
                lebar_plano: ioMounting.lebar_plano || 0,
                panjang_plano: ioMounting.panjang_plano || 0,
                id_kertas: ioMounting.id_kertas || 0,
                nama_kertas: ioMounting.nama_kertas || '',
                jumlah_warna: ioMounting.jumlah_warna || 0,
                warna_depan: ioMounting.warna_depan || 0,
                warna_belakang: ioMounting.warna_belakang || 0,
                keterangan_warna_depan: ioMounting.keterangan_warna_depan || '',
                keterangan_warna_belakang:
                  ioMounting.keterangan_warna_belakang || '',
                id_coating_depan: ioMounting.id_coating_depan || 0,
                id_coating_belakang: ioMounting.id_coating_belakang || 0,
                nama_coating_depan: ioMounting.nama_coating_depan || '',
                nama_coating_belakang: ioMounting.nama_coating_belakang || '',
                merk_coating_depan: ioMounting.merk_coating_depan || '',
                merk_coating_belakang: ioMounting.merk_coating_belakang || '',
                id_jenis_pons: ioMounting.id_jenis_pons || 0,
                nama_jenis_pons: ioMounting.nama_jenis_pons || '',
                keterangan_jenis_pons: ioMounting.keterangan_jenis_pons || '',
                id_lem: ioMounting.id_lem || 0,
                nama_lem: ioMounting.nama_lem || '',
                keterangan_lem: ioMounting.keterangan_lem || '',
                merk_komp_lem: ioMounting.merk_komp_lem || '',
                merk_serat_kertas: ioMounting.merk_serat_kertas || '',
                id_layout: ioMounting.id_layout || '',
                lebar_layout: ioMounting.lebar_layout || 0,
                panjang_layout: ioMounting.panjang_layout || 0,
                ukuran_cetak_panjang_1: ioMounting.ukuran_cetak_panjang_1 || 0,
                ukuran_cetak_lebar_1: ioMounting.ukuran_cetak_lebar_1 || 0,
                ukuran_cetak_bagian_1: ioMounting.ukuran_cetak_bagian_1 || 0,
                ukuran_cetak_isi_1: ioMounting.ukuran_cetak_isi_1 || 0,
                ukuran_cetak_panjang_2: ioMounting.ukuran_cetak_panjang_2 || 0,
                ukuran_cetak_lebar_2: ioMounting.ukuran_cetak_lebar_2 || 0,
                ukuran_cetak_bagian_2: ioMounting.ukuran_cetak_bagian_2 || 0,
                ukuran_cetak_isi_2: ioMounting.ukuran_cetak_isi_2 || 0,
                isi_dalam_1_pack: ioMounting.isi_dalam_1_pack || 0,
                jenis_pack: ioMounting.jenis_pack || '',
                keterangan_pack: ioMounting.keterangan_pack || '',
                is_ukuran_partisi_sekat:
                  ioMounting.is_ukuran_partisi_sekat || false,
                lebar_partisi_1: ioMounting.lebar_partisi_1 || 0,
                panjang_partisi_1: ioMounting.panjang_partisi_1 || 0,
                lebar_partisi_2: ioMounting.lebar_partisi_2 || 0,
                panjang_partisi_2: ioMounting.panjang_partisi_2 || 0,
                tambahan_insheet_druk: ioMounting.tambahan_insheet_druk || 0,
                lampiran: ioMounting.lampiran || '',
                untuk: ioMounting.untuk || '',
                keterangan_revisi: ioMounting.keterangan_revisi || '',
                is_active: ioMounting.is_active ?? true,
                createdAt: ioMounting.createdAt || '',
                updatedAt: ioMounting.updatedAt || '',
                tahapan: ioMounting.tahapan || [],
                _joMountingRef: existingJoMounting || null,
              };
            });

            setMountingData(mergedMountings);

            const selectedJoMounting = joDetail.jo_mounting?.find(
              (jm: any) => jm.is_selected,
            );
            if (selectedJoMounting) {
              setSelectedMounting(selectedJoMounting.id_io_mounting);
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

        if (joDetail.id_customer) {
          await fetchCustomerData(joDetail.id_customer);
        }

        setTimeout(() => setIsInitialEditLoad(false), 100);
      }
    } catch (error) {
      console.error('Error fetching JO detail:', error);
      alert('Gagal mengambil data JO');
      setIsInitialEditLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ ...initialFormData, tipe_jo: tipeJO });
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
    setIsInitialEditLoad(false);
    setOriginalQty(0);
    setHasQtyBeenEdited(false);
    setCreateBlockReasons([]);
  };

  useEffect(() => {
    if (isOpen && editMode && editJOId) {
      fetchJODetail(editJOId);
    } else if (isOpen && !editMode) {
      resetForm();
    }
  }, [isOpen, editMode, editJOId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getKetentuanInsheet = (rawDruk: number): any => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return rawDruk >= batasBawah && rawDruk <= batasAtas;
    });
    return ketentuan || { nilai: 0, is_persentase: false };
  };

  // ── SO change handler ─────────────────────────────────────────────────────
  const handleSOChange = (soId: number) => {
    const selectedSO = soData.find((so) => so.id === soId);
    if (selectedSO) {
      // Compute block reasons from SO → io.io_mounting[].tahapan[]
      const allTahapan: TahapanItem[] =
        selectedSO.io?.io_mounting?.flatMap(
          (m: { tahapan: TahapanItem[] }) => m.tahapan ?? [],
        ) ?? [];
      setCreateBlockReasons(getCreateBlockReasons(allTahapan));

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
        tgl_kirim: selectedSO.tgl_pengiriman
          ? selectedSO.tgl_pengiriman.split('T')[0]
          : new Date().toISOString().split('T')[0],
      }));

      if (!editMode) fetchMountingData(selectedSO.id_io);
      fetchCustomerData(selectedSO.id_customer);
    } else {
      // Deselected
      setCreateBlockReasons([]);
    }
  };

  // NEW: IO change handler (for IO proof mode)
  const handleIOChange = (ioId: number) => {
    const selectedIO = ioProofData.find((io) => io.id === ioId);
    if (selectedIO) {
      // Compute block reasons from IO → io_mounting[].tahapan[]
      const allTahapan: TahapanItem[] =
        selectedIO.io_mounting?.flatMap((m) => m.tahapan ?? []) ?? [];
      setCreateBlockReasons(getCreateBlockReasons(allTahapan));

      setFormData((prev) => ({
        ...prev,
        id_so: 0,
        no_so: '',
        id_io: selectedIO.id,
        id_customer: selectedIO.id_customer,
        id_produk: selectedIO.id_produk || 0,
        no_io: selectedIO.no_io,
        customer: selectedIO.customer,
        produk: selectedIO.produk,
        po_qty: 0,
        no_po_customer: '',
        alamat_pengiriman: selectedIO.alamat_pengiriman || '',
        standar_warna: selectedIO.ada_standar_warna || '',
        status_produk: selectedIO.status_produk || '',
        status_jo: '-',
        tgl_kirim: selectedIO.tgl_pengiriman
          ? selectedIO.tgl_pengiriman.split('T')[0]
          : new Date().toISOString().split('T')[0],
      }));

      fetchMountingData(selectedIO.id);
      fetchCustomerData(selectedIO.id_customer);
    } else {
      setCreateBlockReasons([]);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        setFormData((prev) => ({
          ...prev,
          spesifikasi: mounting.spesifikasi || '',
        }));
        if (!editMode && formData.qty) {
          calculateInsheetFromQty(formData.qty, mounting);
        }
      }
    }
  };

  const handleTotalInsheetChange = (totalValue: number) => {
    if (!selectedMounting) return;
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

    if (editMode) setHasQtyBeenEdited(true);
  };

  const handleQtyChange = (newQty: number) => {
    if (editMode && newQty !== originalQty) setHasQtyBeenEdited(true);
    setFormData((prev) => ({ ...prev, qty: newQty }));

    if (!selectedMounting) return;
    const mounting = mountingData.find((m) => m.id === selectedMounting);
    if (mounting && (!editMode || hasQtyBeenEdited || newQty !== originalQty)) {
      calculateInsheetFromQty(newQty, mounting);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isIOBased =
      isIOProofMode || (editMode && !formData.id_so && !!formData.id_io);

    if (isIOBased) {
      if (!formData.id_io) {
        alert('Pilih IO terlebih dahulu');
        return;
      }
    } else {
      if (!formData.id_so) {
        alert('Pilih SO terlebih dahulu');
        return;
      }
    }

    if (!selectedMounting) {
      alert('Pilih mounting terlebih dahulu');
      return;
    }

    // Guard against blocked submission
    if (!editMode && createBlockReasons.length > 0) {
      alert(
        'JO tidak dapat dibuat:\n' +
          createBlockReasons.map((r) => `• ${r}`).join('\n'),
      );
      return;
    }

    const displayedJumlahDruk =
      insheetValues.jumlah_druk + insheetValues.total_insheet;

    const joMountingData = mountingData.map(
      (mounting: ExtendedMountingData) => {
        const isSelected = mounting.id === selectedMounting;
        const joMountingRef = mounting._joMountingRef;

        if (isSelected) {
          return {
            id: joMountingRef?.id || null,
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
            id: joMountingRef?.id || null,
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
      },
    );

    const submitData = { ...formData, jo_mounting: joMountingData };

    try {
      setLoading(true);
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
      }
    } catch (error: any) {
      console.error('Error saving JO:', error);
      alert(error.response?.data?.msg || 'Gagal menyimpan JO');
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

  // Determine if submit is blocked (only for create mode)
  const isSubmitBlocked = !editMode && createBlockReasons.length > 0;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center w-full h-full px-4 py-4">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {editMode ? `Edit ${tipeJO}` : `Tambah ${tipeJO}`}
                </h2>
                {isIOProofMode && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-teal-400 text-white rounded-full">
                    Dari IO
                  </span>
                )}
                {tipeJO === 'JO PROOF' && !isIOProofMode && !editMode && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-400 text-white rounded-full">
                    Dari SO
                  </span>
                )}
              </div>
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

          {/* ── Block reasons banner (create mode only, after SO/IO is selected) ── */}
          {!editMode && createBlockReasons.length > 0 && (
            <div className="flex-shrink-0 mx-6 mt-4 flex items-start gap-3 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">
                  JO tidak dapat dibuat — selesaikan item berikut terlebih
                  dahulu:
                </p>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {createBlockReasons.map((reason, i) => (
                    <li key={i} className="text-xs text-red-600">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Body — Two Column Layout */}
          <div className="flex-1 overflow-hidden flex">
            {/* LEFT */}
            <div className="w-1/3 border-r overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-6">
                <BasicInfoSection
                  formData={formData}
                  soData={soData}
                  ioProofData={ioProofData}
                  onSOChange={handleSOChange}
                  onIOChange={handleIOChange}
                  loadingMounting={loadingMounting}
                  editMode={editMode}
                  isIOProofMode={isIOProofMode}
                />
                <ProductionDetailsSection
                  formData={formData}
                  onChange={handleFieldChange}
                  onQtyChange={handleQtyChange}
                />
              </div>
            </div>

            {/* RIGHT */}
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
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>

            {/* Submit button — with tooltip when blocked */}
            <div className="relative group">
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedMounting || isSubmitBlocked}
                className={`px-5 py-2 text-sm font-medium text-white border border-transparent rounded-md flex items-center gap-2 transition-colors ${
                  isSubmitBlocked
                    ? 'bg-red-400 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                }`}
              >
                {loading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSubmitBlocked && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                )}
                {loading
                  ? 'Menyimpan...'
                  : editMode
                  ? 'Update JO'
                  : isSubmitBlocked
                  ? 'Tidak Dapat Dibuat'
                  : 'Simpan JO'}
              </button>

              {/* Hover tooltip showing block reasons */}
              {isSubmitBlocked && (
                <div className="absolute z-20 bottom-full right-0 mb-2 w-64 bg-white text-black text-xs border border-red-300 rounded-lg shadow-lg p-3 hidden group-hover:block pointer-events-none">
                  <p className="font-semibold mb-1.5 text-red-600">
                    Tidak bisa membuat JO:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {createBlockReasons.map((reason, i) => (
                      <li key={i} className="text-gray-700">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JOPPICCreateModal;
