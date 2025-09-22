import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface PressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

interface MesinOption {
  id: number;
  nama_barang: string;
  harga: number;
  kode_barang: string;
  kategori: string;
  batas_harga?: number;
}

interface TahapanResponse {
  id: number;
  nama_tahapan: string;
}

interface MesinTahapanResponse {
  id_mesin_tahapan: number;
  mesin: {
    nama_mesin: string;
  };
}

interface Option {
  value: number;
  label: string;
}

const PressTab: React.FC<PressTabProps> = ({ formData, onInputChange }) => {
  const [mesinOptions, setMesinOptions] = useState<MesinOption[]>([]);
  const [selectedMesin, setSelectedMesin] = useState<MesinOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Coating states
  const [coatingDepanOptions, setCoatingDepanOptions] = useState<MesinOption[]>(
    [],
  );
  const [coatingBelakangOptions, setCoatingBelakangOptions] = useState<
    MesinOption[]
  >([]);
  const [selectedCoatingDepan, setSelectedCoatingDepan] =
    useState<MesinOption | null>(null);
  const [selectedCoatingBelakang, setSelectedCoatingBelakang] =
    useState<MesinOption | null>(null);
  const [loadingCoating, setLoadingCoating] = useState(false);

  // Mesin coating states
  const [mesinCoatingDepanOptions, setMesinCoatingDepanOptions] = useState<
    Option[]
  >([]);
  const [mesinCoatingBelakangOptions, setMesinCoatingBelakangOptions] =
    useState<Option[]>([]);
  const [selectedMesinCoatingDepan, setSelectedMesinCoatingDepan] =
    useState<number>(0);
  const [selectedMesinCoatingBelakang, setSelectedMesinCoatingBelakang] =
    useState<number>(0);
  const [isLoadingMesinCoatingDepan, setIsLoadingMesinCoatingDepan] =
    useState(false);
  const [isLoadingMesinCoatingBelakang, setIsLoadingMesinCoatingBelakang] =
    useState(false);

  const normalRateTable = {
    R700: { base: 225000, rates: [65, 60, 55, 50, 45, 40] },
    RR: { base: 200000, rates: [65, 60, 55, 50, 45, 40] },
    PM: { base: 150000, rates: [45, 40, 35, 30, 25, 22.5] },
    SM: { base: 150000, rates: [45, 40, 35, 30, 25, 22.5] },
    GTO1: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
    GTO2: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
    GTO4: { base: 80000, rates: [26, 25, 20, 18, 15, 15] },
  };

  // Fetch mesin options on component mount
  useEffect(() => {
    const fetchMesinOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/barang`,
          {
            params: {
              kategori: 'Plate',
            },
          },
        );

        if (response.data && response.data.data) {
          setMesinOptions(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching mesin options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesinOptions();
  }, []);

  // Fetch coating options
  useEffect(() => {
    const fetchCoatingOptions = async () => {
      setLoadingCoating(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/barang`,
          {
            params: {
              kategori: 'Coating',
            },
          },
        );

        if (response.data && response.data.data) {
          const coatingData = response.data.data || [];
          setCoatingDepanOptions(coatingData);
          setCoatingBelakangOptions(coatingData);
        }
      } catch (error) {
        console.error('Error fetching coating options:', error);
      } finally {
        setLoadingCoating(false);
      }
    };

    fetchCoatingOptions();
  }, []);

  // Fetch mesin coating depan
  useEffect(() => {
    const fetchMesinCoatingDepan = async () => {
      setIsLoadingMesinCoatingDepan(true);
      try {
        // First, get all tahapan
        const tahapanResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapan`,
        );

        // Find tahapan with nama_tahapan containing "coating" (case insensitive)
        const coatingTahapan = tahapanResponse.data.data.find(
          (tahapan: TahapanResponse) =>
            tahapan.nama_tahapan.toLowerCase().includes('coating'),
        );

        if (coatingTahapan) {
          // Get mesin for this tahapan
          const mesinResponse = await axios.get(
            `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
            {
              params: {
                id_tahapan: coatingTahapan.id,
              },
            },
          );

          const options: Option[] = mesinResponse.data.data.map(
            (item: MesinTahapanResponse) => ({
              value: item.id_mesin_tahapan,
              label: item.mesin.nama_mesin,
            }),
          );

          setMesinCoatingDepanOptions(options);
        }
      } catch (error) {
        console.error('Error fetching mesin coating depan:', error);
      } finally {
        setIsLoadingMesinCoatingDepan(false);
      }
    };

    fetchMesinCoatingDepan();
  }, []);

  // Fetch mesin coating belakang (same as depan for now)
  useEffect(() => {
    const fetchMesinCoatingBelakang = async () => {
      setIsLoadingMesinCoatingBelakang(true);
      try {
        // First, get all tahapan
        const tahapanResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapan`,
        );

        // Find tahapan with nama_tahapan containing "coating" (case insensitive)
        const coatingTahapan = tahapanResponse.data.data.find(
          (tahapan: TahapanResponse) =>
            tahapan.nama_tahapan.toLowerCase().includes('coating'),
        );

        if (coatingTahapan) {
          // Get mesin for this tahapan
          const mesinResponse = await axios.get(
            `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
            {
              params: {
                id_tahapan: coatingTahapan.id,
              },
            },
          );

          const options: Option[] = mesinResponse.data.data.map(
            (item: MesinTahapanResponse) => ({
              value: item.id_mesin_tahapan,
              label: item.mesin.nama_mesin,
            }),
          );

          setMesinCoatingBelakangOptions(options);
        }
      } catch (error) {
        console.error('Error fetching mesin coating belakang:', error);
      } finally {
        setIsLoadingMesinCoatingBelakang(false);
      }
    };

    fetchMesinCoatingBelakang();
  }, []);

  // Initialize selected options from formData when options are loaded
  useEffect(() => {
    if (formData.id_jenis_mesin_cetak && mesinOptions.length > 0) {
      const mesin = mesinOptions.find(
        (m) => m.id === Number(formData.id_jenis_mesin_cetak),
      );
      setSelectedMesin(mesin || null);
    }
  }, [formData.id_jenis_mesin_cetak, mesinOptions]);

  useEffect(() => {
    if (formData.id_coating_depan && coatingDepanOptions.length > 0) {
      const coating = coatingDepanOptions.find(
        (c) => c.id === Number(formData.id_coating_depan),
      );
      setSelectedCoatingDepan(coating || null);
    }
  }, [formData.id_coating_depan, coatingDepanOptions]);

  useEffect(() => {
    if (formData.id_coating_belakang && coatingBelakangOptions.length > 0) {
      const coating = coatingBelakangOptions.find(
        (c) => c.id === Number(formData.id_coating_belakang),
      );
      setSelectedCoatingBelakang(coating || null);
    }
  }, [formData.id_coating_belakang, coatingBelakangOptions]);

  useEffect(() => {
    if (formData.id_mesin_coating_depan) {
      setSelectedMesinCoatingDepan(Number(formData.id_mesin_coating_depan));
    }
  }, [formData.id_mesin_coating_depan]);

  useEffect(() => {
    if (formData.id_mesin_coating_belakang) {
      setSelectedMesinCoatingBelakang(
        Number(formData.id_mesin_coating_belakang),
      );
    }
  }, [formData.id_mesin_coating_belakang]);

  // Function to parse number with thousand separators
  const parseNumberWithSeparator = (
    value: string | number | undefined,
  ): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    // Remove dots (thousand separators) and convert to number
    return Number(String(value).replace(/\./g, ''));
  };

  // Function to get safe string value
  const getSafeStringValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    return String(value);
  };

  // Function to get machine type from nama_barang
  const getMachineType = (namaBarang: string): string => {
    const name = namaBarang.toUpperCase();
    if (name.includes('R700')) return 'R700';
    if (name.includes('RR')) return 'RR';
    if (name.includes('PM')) return 'PM';
    if (name.includes('SM')) return 'SM';
    if (name.includes('GTO1')) return 'GTO1';
    if (name.includes('GTO2')) return 'GTO2';
    if (name.includes('GTO4')) return 'GTO4';
    return 'R700'; // default
  };

  // Function to get rate index based on rate value - CORRECTED
  const getRateIndex = (rate: number): number => {
    if (rate <= 3000) return -1; // This shouldn't be used anymore since base rate is handled separately
    if (rate > 3000 && rate <= 5000) return 0;
    if (rate > 5000 && rate <= 10000) return 1;
    if (rate > 10000 && rate <= 20000) return 2;
    if (rate > 20000 && rate <= 30000) return 3;
    if (rate > 30000 && rate <= 50000) return 4;
    if (rate > 50000) return 5;
    return 0; // fallback
  };

  // Function to check if customer is Sanbe
  const isSanbeCustomer = (customerName: string): boolean => {
    const name = customerName.toLowerCase();
    return name.includes('sanbe') || name.includes('caprifarmindo');
  };

  // Main calculation function for printing cost - FIXED
  const calculateJumlahHargaCetak = (): number => {
    // Check if required fields are available
    if (
      !selectedMesin ||
      !formData.total_kertas ||
      (!formData.ukuran_cetak_bagian_1 && !formData.ukuran_cetak_bagian_2)
    ) {
      return 0;
    }

    // Parse numbers correctly with thousand separators
    const total_kertas = parseNumberWithSeparator(formData.total_kertas);
    const totalWarna = Number(formData.jumlah_warna) || 0;
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;

    // If both ukuran_cetak_bagian are 0, return 0
    if (ukuranCetakBagian1 === 0 && ukuranCetakBagian2 === 0) {
      return 0;
    }

    // Calculate rate consistently: total_kertas × (ukuran_cetak_bagian_1 + ukuran_cetak_bagian_2)
    const calculatedRate =
      total_kertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

    const rateTable = normalRateTable;

    // Get machine type
    const machineType = getMachineType(selectedMesin.nama_barang);
    const machineRates = rateTable[machineType as keyof typeof rateTable];

    if (!machineRates) {
      console.error('Machine type not found:', machineType);
      return 0;
    }

    // Calculate printing cost using the same calculatedRate for both threshold check and calculation
    if (calculatedRate <= 3000) {
      // Use base rate for calculatedRate <= 3000
      const normalRate2 = machineRates.base * totalWarna;
      return normalRate2;
    } else {
      // Use tiered rate: (tierRate × totalWarna) × calculatedRate
      const rateIndex = getRateIndex(calculatedRate);
      const tierRate = machineRates.rates[rateIndex];
      return tierRate * totalWarna * calculatedRate;
    }
  };

  // Calculate coating depan cost with batas_harga condition
  const calculateHargaCoatingDepan = (): number => {
    if (!selectedCoatingDepan || !formData.total_kertas) {
      return 0;
    }

    const total_kertas = parseNumberWithSeparator(formData.total_kertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const ukuranCetakPanjang1 = Number(formData.ukuran_cetak_panjang_1) || 0;
    const ukuranCetakPanjang2 = Number(formData.ukuran_cetak_panjang_2) || 0;
    const ukuranCetakLebar1 = Number(formData.ukuran_cetak_lebar_1) || 0;
    const ukuranCetakLebar2 = Number(formData.ukuran_cetak_lebar_2) || 0;

    // Calculate the result using the formula
    const calculatedResult =
      total_kertas *
      (ukuranCetakBagian1 + ukuranCetakBagian2) *
      ((ukuranCetakPanjang1 + ukuranCetakPanjang2) *
        (ukuranCetakLebar1 + ukuranCetakLebar2)) *
      selectedCoatingDepan.harga;

    // Check if calculated result is below batas_harga, use batas_harga instead
    const batasHarga = selectedCoatingDepan.batas_harga || 0;

    return calculatedResult < batasHarga ? batasHarga : calculatedResult;
  };

  // Calculate coating belakang cost
  const calculateHargaCoatingBelakang = (): number => {
    if (!selectedCoatingBelakang || !formData.total_kertas) {
      return 0;
    }

    const total_kertas = parseNumberWithSeparator(formData.total_kertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const ukuranCetakPanjang1 = Number(formData.ukuran_cetak_panjang_1) || 0;
    const ukuranCetakPanjang2 = Number(formData.ukuran_cetak_panjang_2) || 0;
    const ukuranCetakLebar1 = Number(formData.ukuran_cetak_lebar_1) || 0;
    const ukuranCetakLebar2 = Number(formData.ukuran_cetak_lebar_2) || 0;

    // Calculate the result using the formula
    const calculatedResult =
      total_kertas *
      (ukuranCetakBagian1 + ukuranCetakBagian2) *
      ((ukuranCetakPanjang1 + ukuranCetakPanjang2) *
        (ukuranCetakLebar1 + ukuranCetakLebar2)) *
      selectedCoatingBelakang.harga;

    // Check if calculated result is below batas_harga, use batas_harga instead
    const batasHarga = selectedCoatingBelakang.batas_harga || 0;

    return calculatedResult < batasHarga ? batasHarga : calculatedResult;
  };

  // Add helper functions to check if batas_harga is being used
  const isUsingBatasHargaDepan = (): boolean => {
    if (!selectedCoatingDepan || !formData.total_kertas) return false;

    const total_kertas = parseNumberWithSeparator(formData.total_kertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const ukuranCetakPanjang1 = Number(formData.ukuran_cetak_panjang_1) || 0;
    const ukuranCetakPanjang2 = Number(formData.ukuran_cetak_panjang_2) || 0;
    const ukuranCetakLebar1 = Number(formData.ukuran_cetak_lebar_1) || 0;
    const ukuranCetakLebar2 = Number(formData.ukuran_cetak_lebar_2) || 0;

    const calculatedResult =
      total_kertas *
      (ukuranCetakBagian1 + ukuranCetakBagian2) *
      ((ukuranCetakPanjang1 + ukuranCetakPanjang2) *
        (ukuranCetakLebar1 + ukuranCetakLebar2)) *
      selectedCoatingDepan.harga;

    const batasHarga = selectedCoatingDepan.batas_harga || 0;
    return calculatedResult < batasHarga && batasHarga > 0;
  };

  const isUsingBatasHargaBelakang = (): boolean => {
    if (!selectedCoatingBelakang || !formData.total_kertas) return false;

    const total_kertas = parseNumberWithSeparator(formData.total_kertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const ukuranCetakPanjang1 = Number(formData.ukuran_cetak_panjang_1) || 0;
    const ukuranCetakPanjang2 = Number(formData.ukuran_cetak_panjang_2) || 0;
    const ukuranCetakLebar1 = Number(formData.ukuran_cetak_lebar_1) || 0;
    const ukuranCetakLebar2 = Number(formData.ukuran_cetak_lebar_2) || 0;

    const calculatedResult =
      total_kertas *
      (ukuranCetakBagian1 + ukuranCetakBagian2) *
      ((ukuranCetakPanjang1 + ukuranCetakPanjang2) *
        (ukuranCetakLebar1 + ukuranCetakLebar2)) *
      selectedCoatingBelakang.harga;

    const batasHarga = selectedCoatingBelakang.batas_harga || 0;
    return calculatedResult < batasHarga && batasHarga > 0;
  };

  // Calculate total coating cost
  const calculateJumlahHargaCoating = (): number => {
    return calculateHargaCoatingDepan() + calculateHargaCoatingBelakang();
  };

  // Calculate plate count using real jumlah_warna (no rounding)
  const getPlateCount = () => {
    const jumlahWarna = Number(formData.jumlah_warna) || 0;
    return jumlahWarna;
  };

  // Calculate total harga plate
  const calculateHargaPlate = () => {
    if (!selectedMesin) return 0;
    const plateCount = getPlateCount();
    return selectedMesin.harga * plateCount;
  };

  // Modified handle functions to save to formData
  const handleMesinChange = (value: any) => {
    const selected = mesinOptions.find((mesin) => mesin.id === value) || null;
    setSelectedMesin(selected);

    // Save to formData
    const event = {
      target: {
        name: 'id_jenis_mesin_cetak',
        value: value || '',
        type: 'select',
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(event);
  };

  const handleCoatingDepanChange = (value: any) => {
    const selected =
      coatingDepanOptions.find((coating) => coating.id === value) || null;
    setSelectedCoatingDepan(selected);

    // Save to formData
    const event = {
      target: {
        name: 'id_coating_depan',
        value: value || '',
        type: 'select',
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(event);
  };

  const handleCoatingBelakangChange = (value: any) => {
    const selected =
      coatingBelakangOptions.find((coating) => coating.id === value) || null;
    setSelectedCoatingBelakang(selected);

    // Save to formData
    const event = {
      target: {
        name: 'id_coating_belakang',
        value: value || '',
        type: 'select',
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(event);
  };

  const handleMesinCoatingDepanChange = (value: any) => {
    setSelectedMesinCoatingDepan(value);

    // Save to formData
    const event = {
      target: {
        name: 'id_mesin_coating_depan',
        value: value || '',
        type: 'select',
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(event);
  };

  const handleMesinCoatingBelakangChange = (value: any) => {
    setSelectedMesinCoatingBelakang(value);

    // Save to formData
    const event = {
      target: {
        name: 'id_mesin_coating_belakang',
        value: value || '',
        type: 'select',
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(event);
  };

  // Update jumlah_harga_cetak in formData whenever it changes
  useEffect(() => {
    const hargaCetak = calculateJumlahHargaCetak();
    const event = {
      target: {
        name: 'jumlah_harga_cetak',
        value: hargaCetak.toString(),
        type: 'number',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  }, [
    selectedMesin,
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    formData.jumlah_warna,
  ]);
  // Update harga_plate in formData whenever it changes
  useEffect(() => {
    const hargaPlate = calculateHargaPlate();
    const event = {
      target: {
        name: 'harga_plate',
        value: hargaPlate.toString(),
        type: 'number',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  }, [selectedMesin, formData.jumlah_warna]);
  // Update jumlah_harga_coating_depan in formData whenever it changes
  useEffect(() => {
    const hargaCoatingDepan = calculateHargaCoatingDepan();
    const event = {
      target: {
        name: 'jumlah_harga_coating_depan',
        value: hargaCoatingDepan.toString(),
        type: 'number',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  }, [
    selectedCoatingDepan,
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    formData.ukuran_cetak_panjang_1,
    formData.ukuran_cetak_panjang_2,
    formData.ukuran_cetak_lebar_1,
    formData.ukuran_cetak_lebar_2,
  ]);

  // Update jumlah_harga_coating_belakang in formData whenever it changes
  useEffect(() => {
    const hargaCoatingBelakang = calculateHargaCoatingBelakang();
    const event = {
      target: {
        name: 'jumlah_harga_coating_belakang',
        value: hargaCoatingBelakang.toString(),
        type: 'number',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  }, [
    selectedCoatingBelakang,
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    formData.ukuran_cetak_panjang_1,
    formData.ukuran_cetak_panjang_2,
    formData.ukuran_cetak_lebar_1,
    formData.ukuran_cetak_lebar_2,
  ]);

  // Update total_harga_coating in formData whenever it changes
  useEffect(() => {
    const totalHargaCoating = calculateJumlahHargaCoating();
    const event = {
      target: {
        name: 'total_harga_coating',
        value: totalHargaCoating.toString(),
        type: 'number',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  }, [
    selectedCoatingDepan,
    selectedCoatingBelakang,
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    formData.ukuran_cetak_panjang_1,
    formData.ukuran_cetak_panjang_2,
    formData.ukuran_cetak_lebar_1,
    formData.ukuran_cetak_lebar_2,
  ]);
  // Debug effect - UPDATED
  useEffect(() => {
    const total_kertasOriginal = formData.total_kertas;
    const total_kertasParsed = parseNumberWithSeparator(formData.total_kertas);
    const ukuranCetakBagian1 = Number(formData.ukuran_cetak_bagian_1) || 0;
    const ukuranCetakBagian2 = Number(formData.ukuran_cetak_bagian_2) || 0;
    const calculatedRate =
      total_kertasParsed * (ukuranCetakBagian1 + ukuranCetakBagian2);

    console.log('Debug values:', {
      total_kertasOriginal,
      total_kertasParsed,
      ukuran_cetak_bagian_1: formData.ukuran_cetak_bagian_1,
      ukuran_cetak_bagian_2: formData.ukuran_cetak_bagian_2,
      calculatedRate,
    });
  }, [
    formData.total_kertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
  ]);

  return (
    <div className="space-y-6">
      {/* Press Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          Press Information
        </h3>

        <div className="grid grid-cols-5 gap-4">
          {/* Printing Insheet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Printing Insheet
            </label>
            <input
              type="text"
              name="print_insheet"
              value={getSafeStringValue(formData.print_insheet)}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter insheet"
            />
          </div>

          {/* Jenis Mesin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Mesin
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Pilih Mesin' },
                  ...mesinOptions.map((mesin) => ({
                    value: mesin.id,
                    label: `${mesin.kode_barang} - ${mesin.nama_barang}`,
                  })),
                ]}
                value={selectedMesin?.id || 0}
                onChange={handleMesinChange}
                placeholder="Pilih Mesin"
                required
              />
            )}
          </div>

          {/* Plate Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">{getPlateCount()}</span>
              <span className="text-xs text-gray-500 ml-1">
                (exact from {getSafeStringValue(formData.jumlah_warna) || '0'}{' '}
                colors)
              </span>
            </div>
          </div>

          {/* Harga per Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga per Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {selectedMesin
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedMesin.harga)
                  : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Total Harga Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Harga Plate
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50">
              <span className="font-semibold text-blue-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateHargaPlate())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Machine Details - Only show if machine is selected */}
      {selectedMesin && (
        <div className="border-b pb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Selected Machine Details
          </h4>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Code:</span>
              <div className="font-medium">{selectedMesin.kode_barang}</div>
            </div>
            <div>
              <span className="text-gray-500">Name:</span>
              <div className="font-medium">{selectedMesin.nama_barang}</div>
            </div>
            <div>
              <span className="text-gray-500">Category:</span>
              <div className="font-medium">{selectedMesin.kategori}</div>
            </div>
            <div>
              <span className="text-gray-500">Unit Price:</span>
              <div className="font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(selectedMesin.harga)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Calculation:</span>
              <div className="font-medium text-xs">
                {getPlateCount()} ×{' '}
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(selectedMesin.harga)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printing Cost Calculation Section */}
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-6 flex items-center">
          Printing Cost Calculation
        </h3>

        <div className="grid grid-cols-4 gap-4">
          {/* Rate Calculation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Calculation
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {(() => {
                  const total_kertas = parseNumberWithSeparator(
                    formData.total_kertas,
                  );
                  const ukuranCetakBagian1 =
                    Number(formData.ukuran_cetak_bagian_1) || 0;
                  const ukuranCetakBagian2 =
                    Number(formData.ukuran_cetak_bagian_2) || 0;
                  const rate =
                    total_kertas * (ukuranCetakBagian1 + ukuranCetakBagian2);
                  return new Intl.NumberFormat('id-ID').format(rate);
                })()}
              </span>
            </div>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {isSanbeCustomer(getSafeStringValue(formData.id_customer)) ? (
                  <span className="text-orange-600">Sanbe Rate</span>
                ) : (
                  <span className="text-blue-600">Normal Rate</span>
                )}
              </span>
            </div>
          </div>

          {/* Machine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine Type
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {selectedMesin
                  ? getMachineType(selectedMesin.nama_barang)
                  : '-'}
              </span>
            </div>
          </div>

          {/* Jumlah Harga Cetak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Harga Cetak
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-green-50">
              <span className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateJumlahHargaCetak())}
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Details */}
        {selectedMesin && formData.total_kertas && (
          <div className="pb-4 mt-4 border-b ">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Calculation Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Formula:</span>
                <div className="font-medium">
                  {(() => {
                    const total_kertas = parseNumberWithSeparator(
                      formData.total_kertas,
                    );
                    const totalWarna = Number(formData.jumlah_warna) || 0;
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const calculatedRate =
                      total_kertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    if (calculatedRate <= 3000) {
                      return `Base Rate (${new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(
                        normalRateTable[
                          getMachineType(
                            selectedMesin.nama_barang,
                          ) as keyof typeof normalRateTable
                        ].base,
                      )})`;
                    } else {
                      const rateIndex = getRateIndex(calculatedRate);
                      const rateTable = normalRateTable;
                      const machineType = getMachineType(
                        selectedMesin.nama_barang,
                      );
                      const machineRates =
                        rateTable[machineType as keyof typeof rateTable];
                      const tierRate = machineRates?.rates[rateIndex] || 0;

                      return `(${tierRate} × ${totalWarna}) × ${new Intl.NumberFormat(
                        'id-ID',
                      ).format(calculatedRate)}`;
                    }
                  })()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Rate Category:</span>
                <div className="font-medium">
                  {(() => {
                    const total_kertas = parseNumberWithSeparator(
                      formData.total_kertas,
                    );
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const calculatedRate =
                      total_kertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    if (calculatedRate <= 3000) return '≤ 3,000 (Base Rate)';
                    if (calculatedRate > 3000 && calculatedRate <= 5000)
                      return '3,001 - 5,000';
                    if (calculatedRate > 5000 && calculatedRate <= 10000)
                      return '5,001 - 10,000';
                    if (calculatedRate > 10000 && calculatedRate <= 20000)
                      return '10,001 - 20,000';
                    if (calculatedRate > 20000 && calculatedRate <= 30000)
                      return '20,001 - 30,000';
                    if (calculatedRate > 30000 && calculatedRate <= 50000)
                      return '30,001 - 50,000';
                    return '> 50,000';
                  })()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Applied Rate:</span>
                <div className="font-medium">
                  {(() => {
                    const total_kertas = parseNumberWithSeparator(
                      formData.total_kertas,
                    );
                    const ukuranCetakBagian1 =
                      Number(formData.ukuran_cetak_bagian_1) || 0;
                    const ukuranCetakBagian2 =
                      Number(formData.ukuran_cetak_bagian_2) || 0;
                    const calculatedRate =
                      total_kertas * (ukuranCetakBagian1 + ukuranCetakBagian2);

                    const rateTable = normalRateTable;
                    const machineType = getMachineType(
                      selectedMesin.nama_barang,
                    );
                    const machineRates =
                      rateTable[machineType as keyof typeof rateTable];

                    if (!machineRates) return '0';

                    if (calculatedRate <= 3000) {
                      return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(machineRates.base);
                    } else {
                      const rateIndex = getRateIndex(calculatedRate);
                      const tierRate = machineRates.rates[rateIndex];
                      return `${tierRate}`;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coating Section */}
      <div>
        <h3 className="text-lg font-semibold text-purple-600 mb-6 flex items-center">
          Coating Information
        </h3>

        <div className="grid grid-cols-5 gap-4 mb-4">
          {/* Coating Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coating Depan
            </label>
            {loadingCoating ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Pilih Coating Depan' },
                  ...coatingDepanOptions.map((coating) => ({
                    value: coating.id,
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={selectedCoatingDepan?.id || 0}
                onChange={handleCoatingDepanChange}
                placeholder="Pilih Coating Depan"
              />
            )}
          </div>

          {/* Harga Coating Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Coating Depan
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateHargaCoatingDepan())}
              </span>
            </div>
          </div>

          {/* Coating Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coating Belakang
            </label>
            {loadingCoating ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Pilih Coating Belakang' },
                  ...coatingBelakangOptions.map((coating) => ({
                    value: coating.id,
                    label: `${coating.kode_barang} - ${coating.nama_barang}`,
                  })),
                ]}
                value={selectedCoatingBelakang?.id || 0}
                onChange={handleCoatingBelakangChange}
                placeholder="Pilih Coating Belakang"
              />
            )}
          </div>

          {/* Harga Coating Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Coating Belakang
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className="font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateHargaCoatingBelakang())}
              </span>
            </div>
          </div>

          {/* Jumlah Harga Coating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Harga Coating
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-purple-50">
              <span className="font-semibold text-purple-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(calculateJumlahHargaCoating())}
              </span>
            </div>
          </div>
        </div>

        {/* Mesin Coating Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mesin Coating Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesin Coating Depan
            </label>
            {isLoadingMesinCoatingDepan ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Pilih Coating Depan' },
                  ...mesinCoatingDepanOptions,
                ]}
                value={selectedMesinCoatingDepan}
                onChange={handleMesinCoatingDepanChange}
                placeholder="Pilih Coating Depan"
              />
            )}
          </div>

          {/* Mesin Coating Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesin Coating Belakang
            </label>
            {isLoadingMesinCoatingBelakang ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                Loading...
              </div>
            ) : (
              <SearchableSelect
                options={[
                  { value: 0, label: 'Pilih Coating Belakang' },
                  ...mesinCoatingBelakangOptions,
                ]}
                value={selectedMesinCoatingBelakang}
                onChange={handleMesinCoatingBelakangChange}
                placeholder="Pilih Coating Belakang"
              />
            )}
          </div>
        </div>

        {/* Coating Calculation Details */}
        {(selectedCoatingDepan || selectedCoatingBelakang) &&
          formData.total_kertas && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Coating Calculation Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedCoatingDepan && (
                  <div className="border rounded p-3 bg-gray-50">
                    <h5 className="font-medium text-purple-600 mb-2">
                      Coating Depan
                    </h5>
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-500">Material:</span>
                        <span className="font-medium ml-2">
                          {selectedCoatingDepan.nama_barang}
                        </span>
                      </div>

                      {selectedCoatingDepan.batas_harga && (
                        <div>
                          <span className="text-gray-500">Minimum Price:</span>
                          <span className="font-medium ml-2">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(selectedCoatingDepan.batas_harga)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Formula:</span>
                        <div className="font-medium text-xs mt-1">
                          {isUsingBatasHargaDepan() ? (
                            <span className="text-orange-600">
                              Using minimum price (batas harga) because
                              calculated result is below minimum
                            </span>
                          ) : (
                            `${parseNumberWithSeparator(
                              formData.total_kertas,
                            ).toLocaleString('id-ID')} × (${
                              formData.ukuran_cetak_bagian_1 || 0
                            } + ${formData.ukuran_cetak_bagian_2 || 0}) × ((${
                              formData.ukuran_cetak_panjang_1 || 0
                            } + ${formData.ukuran_cetak_panjang_2 || 0}) × (${
                              formData.ukuran_cetak_lebar_1 || 0
                            } + ${
                              formData.ukuran_cetak_lebar_2 || 0
                            })) × ${selectedCoatingDepan.harga.toLocaleString(
                              'id-ID',
                            )}`
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Result:</span>
                        <span className="font-semibold ml-2 text-purple-600">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(calculateHargaCoatingDepan())}
                        </span>
                        {isUsingBatasHargaDepan() && (
                          <span className="text-xs text-orange-600 block">
                            (Applied minimum price)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedCoatingBelakang && (
                  <div className="border rounded p-3 bg-gray-50">
                    <h5 className="font-medium text-purple-600 mb-2">
                      Coating Belakang
                    </h5>
                    <div className="space-y-1">
                      <div>
                        <span className="text-gray-500">Material:</span>
                        <span className="font-medium ml-2">
                          {selectedCoatingBelakang.nama_barang}
                        </span>
                      </div>

                      {selectedCoatingBelakang.batas_harga && (
                        <div>
                          <span className="text-gray-500">Minimum Price:</span>
                          <span className="font-medium ml-2">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(selectedCoatingBelakang.batas_harga)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Formula:</span>
                        <div className="font-medium text-xs mt-1">
                          {isUsingBatasHargaBelakang() ? (
                            <span className="text-orange-600">
                              Using minimum price (batas harga) because
                              calculated result is below minimum
                            </span>
                          ) : (
                            `${parseNumberWithSeparator(
                              formData.total_kertas,
                            ).toLocaleString('id-ID')} × (${
                              formData.ukuran_cetak_bagian_1 || 0
                            } + ${formData.ukuran_cetak_bagian_2 || 0}) × ((${
                              formData.ukuran_cetak_panjang_1 || 0
                            } + ${formData.ukuran_cetak_panjang_2 || 0}) × (${
                              formData.ukuran_cetak_lebar_1 || 0
                            } + ${
                              formData.ukuran_cetak_lebar_2 || 0
                            })) × ${selectedCoatingBelakang.harga.toLocaleString(
                              'id-ID',
                            )}`
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Result:</span>
                        <span className="font-semibold ml-2 text-purple-600">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(calculateHargaCoatingBelakang())}
                        </span>
                        {isUsingBatasHargaBelakang() && (
                          <span className="text-xs text-orange-600 block">
                            (Applied minimum price)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PressTab;
