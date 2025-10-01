import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../types/kalkulasi';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface Option {
  value: number | string;
  label: string;
}

interface JenisKertasResponse {
  id: number;
  kategori: string;
}

interface BarangResponse {
  id: number;
  nama_barang: string;
  gramatur: number;
  panjang: number;
  lebar: number;
  persentase: number;
  harga: number;
  pajak: number;
  kategori: string;
}

interface TahapanResponse {
  id: number;
  kode_tahapan: string;
  nama_tahapan: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MesinTahapanResponse {
  id: number;
  id_tahapan: number;
  id_mesin_tahapan: number;
  shift: string;
  is_active: boolean;
  mesin: {
    id: number;
    kode_mesin: string;
    nama_mesin: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tahapan: TahapanResponse;
  createdAt: string;
  updatedAt: string;
}

interface PrepressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isReadOnly?: boolean;
  copyType?: 'repeat' | 'repeat_perubahan';
}

const PrepressTab: React.FC<PrepressTabProps> = ({
  formData,
  onInputChange,
  isReadOnly = false,
  copyType,
}) => {
  const [jenisKertasOptions, setJenisKertasOptions] = useState<Option[]>([]);
  const [namaKertasOptions, setNamaKertasOptions] = useState<Option[]>([]);
  const [namaKertasData, setNamaKertasData] = useState<BarangResponse[]>([]);
  const [mesinPotongOptions, setMesinPotongOptions] = useState<Option[]>([]);
  const [selectedBarangData, setSelectedBarangData] =
    useState<BarangResponse | null>(null);
  const [isLoadingJenisKertas, setIsLoadingJenisKertas] = useState(false);
  const [isLoadingNamaKertas, setIsLoadingNamaKertas] = useState(false);
  const [isLoadingMesinPotong, setIsLoadingMesinPotong] = useState(false);

  // Selected values - using the same pattern as BasicInfoForm
  const [selectedJenisKertas, setSelectedJenisKertas] = useState<string>('');
  const [selectedNamaKertas, setSelectedNamaKertas] = useState<number>(0);
  const [selectedMesinPotong, setSelectedMesinPotong] = useState<number>(0);

  const getInputClassName = (baseClassName: string) => {
    return isReadOnly
      ? `${baseClassName} bg-gray-100 cursor-not-allowed`
      : baseClassName;
  };

  const getSectionHeaderColor = () => {
    if (copyType === 'repeat') return 'text-blue-600';
    if (copyType === 'repeat_perubahan') return 'text-green-600';
    return 'text-blue-600';
  };

  // Sync selectedJenisKertas when formData changes (same pattern as BasicInfoForm)
  useEffect(() => {
    if (
      formData.jenis_kertas &&
      formData.jenis_kertas !== selectedJenisKertas
    ) {
      setSelectedJenisKertas(formData.jenis_kertas);
    }
  }, [formData.jenis_kertas]);

  // Sync selectedNamaKertas when formData changes
  useEffect(() => {
    if (
      formData.id_kertas &&
      Number(formData.id_kertas) !== selectedNamaKertas
    ) {
      setSelectedNamaKertas(Number(formData.id_kertas));
    }
  }, [formData.id_kertas]);

  // Sync selectedMesinPotong when formData changes
  useEffect(() => {
    if (
      formData.id_mesin_potong &&
      Number(formData.id_mesin_potong) !== selectedMesinPotong
    ) {
      setSelectedMesinPotong(Number(formData.id_mesin_potong));
    }
  }, [formData.id_mesin_potong]);

  // Fetch Jenis Kertas options
  useEffect(() => {
    const fetchJenisKertas = async () => {
      setIsLoadingJenisKertas(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisKertasBarang`,
        );

        const options: Option[] = response.data.data.map(
          (item: JenisKertasResponse) => ({
            value: item.kategori,
            label: item.kategori,
          }),
        );
        setJenisKertasOptions(options);
      } catch (error) {
        console.error('Error fetching jenis kertas:', error);
      } finally {
        setIsLoadingJenisKertas(false);
      }
    };

    fetchJenisKertas();
  }, []);

  // Fetch Mesin Potong options
  useEffect(() => {
    const fetchMesinPotong = async () => {
      setIsLoadingMesinPotong(true);
      try {
        const tahapanResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapan`,
        );

        const potongTahapan = tahapanResponse.data.data.find(
          (tahapan: TahapanResponse) =>
            tahapan.nama_tahapan.toLowerCase().includes('potong'),
        );

        if (potongTahapan) {
          const mesinResponse = await axios.get(
            `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
            {
              params: {
                id_tahapan: potongTahapan.id,
              },
            },
          );
          console.log('Fetched Mesin Potong:', mesinResponse.data.data);
          const options: Option[] = mesinResponse.data.data.map(
            (item: MesinTahapanResponse) => ({
              value: item.id_mesin_tahapan,
              label: item.mesin.nama_mesin,
            }),
          );

          setMesinPotongOptions(options);
        }
      } catch (error) {
        console.error('Error fetching mesin potong:', error);
      } finally {
        setIsLoadingMesinPotong(false);
      }
    };

    fetchMesinPotong();
  }, []);

  // Fetch Nama Kertas options when selectedJenisKertas changes
  useEffect(() => {
    const fetchNamaKertas = async () => {
      if (!selectedJenisKertas) {
        setNamaKertasOptions([]);
        setNamaKertasData([]);
        return;
      }

      setIsLoadingNamaKertas(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/barang`,
          {
            params: {
              kategori: selectedJenisKertas,
            },
          },
        );

        const fullData: BarangResponse[] = response.data.data;
        setNamaKertasData(fullData);
        console.log('option', fullData);
        const options: Option[] = fullData.map((item: BarangResponse) => ({
          value: item.id,
          label: item.nama_barang,
        }));

        setNamaKertasOptions(options);
      } catch (error) {
        console.error('Error fetching nama kertas:', error);
      } finally {
        setIsLoadingNamaKertas(false);
      }
    };

    fetchNamaKertas();
  }, [selectedJenisKertas]);

  // Restore selectedBarangData when selectedNamaKertas changes
  useEffect(() => {
    if (selectedNamaKertas && namaKertasData.length > 0) {
      const selectedBarang = namaKertasData.find(
        (item) => item.id === selectedNamaKertas,
      );
      if (selectedBarang) {
        setSelectedBarangData(selectedBarang);
        // Auto-fill fields when data is restored
        if (copyType) {
          autoFillFields(selectedBarang);
        }
      }
    }
  }, [selectedNamaKertas, namaKertasData]);

  // Helper function to format numbers with thousand separators
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Helper function to parse formatted number back to raw number
  const parseFormattedNumber = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Helper function to round percentage
  const roundPercentage = (value: number): number => {
    return Math.round(value);
  };

  // Calculate Percentage%Apki based on pajak conversion
  const calculatePercentageApki = (
    persentase: number,
    pajak: number,
  ): number => {
    // If persentase is null or 0, default to 100
    if (!persentase || persentase === 0) {
      return 100;
    }

    const pajakConverted = pajak === 11 ? 1.11 : pajak === 12 ? 1.12 : 1;
    const rawPercentage = persentase / pajakConverted;
    return roundPercentage(rawPercentage);
  };

  // Helper function to create synthetic events for auto-fill
  const createSyntheticEvent = (name: string, value: string | number) => {
    return {
      target: {
        name: name,
        value: value.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
  };

  // Calculate Total Harga Kertas automatically
  useEffect(() => {
    if (isReadOnly) return;
    if (!selectedBarangData || !formData.total_kertas) {
      return;
    }

    const total_kertas = parseFormattedNumber(formData.total_kertas.toString());
    if (total_kertas <= 0) {
      return;
    }

    const { harga, persentase, pajak, kategori, gramatur, panjang, lebar } =
      selectedBarangData;
    const percentageApki = calculatePercentageApki(persentase, pajak);

    const pajakPercentage = pajak / 100;

    const hargaAfterTax = harga - harga * pajakPercentage;

    // Normalize kategori untuk comparison (trim whitespace)
    const normalizedKategori = kategori.trim();

    let total_harga_kertas = 0;
    let isDuplex = false;
    let isDuplexKhusus = false;

    // Check exact match untuk kategori dengan formula sederhana (harga × total_kertas)
    const simpleFormulaCategories = [
      'Sticker Chromo',
      'Sticker HVS',
      'NCR_65',
      'NCR_79',
      'BC',
      'DOORSLAG',
    ];

    // Check exact match untuk kategori dengan formula baru (Art Paper, Ivory, Chromo, HVS)
    const newFormulaCategories = ['Art Paper', 'Ivory', 'Chromo', 'HVS'];
    if (simpleFormulaCategories.includes(normalizedKategori)) {
      // Formula sederhana: harga × total_kertas
      total_harga_kertas = hargaAfterTax * total_kertas;

      console.log('=== SIMPLE FORMULA CALCULATION ===');
      console.log('Kategori:', normalizedKategori);
      console.log('Formula: harga_after_tax × total_kertas');
      console.log('---');
      console.log('Input Values:');
      console.log('  - Harga Original:', harga.toLocaleString('id-ID'));
      console.log('  - Pajak:', `${pajak}%`);
      console.log('  - Total Kertas:', total_kertas.toLocaleString('id-ID'));
      console.log('---');
      console.log('Calculation Steps:');
      console.log(
        `  Step 1: Calculate tax amount = ${harga.toLocaleString(
          'id-ID',
        )} × ${pajakPercentage}`,
      );
      console.log(
        `          Tax Amount = ${(harga * pajakPercentage).toLocaleString(
          'id-ID',
        )}`,
      );
      console.log(
        `  Step 2: Calculate harga after tax = ${harga.toLocaleString(
          'id-ID',
        )} - ${(harga * pajakPercentage).toLocaleString('id-ID')}`,
      );
      console.log(
        `          Harga After Tax = ${hargaAfterTax.toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 3: Calculate total = ${hargaAfterTax.toLocaleString(
          'id-ID',
        )} × ${total_kertas.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Total Harga Kertas = ${total_harga_kertas.toLocaleString(
          'id-ID',
        )}`,
      );
      console.log('---');
      console.log(
        'Final Result:',
        Math.round(total_harga_kertas).toLocaleString('id-ID'),
      );
      console.log('===================================\n');
    } else if (newFormulaCategories.includes(normalizedKategori)) {
      // Formula baru: (harga × gramatur × (panjang_cm × lebar_cm)) / 20000 / 500 × total_kertas
      const panjangCm = panjang / 10;
      const lebarCm = lebar / 10;
      const ukuranPlanoCm = panjangCm * lebarCm;

      total_harga_kertas =
        ((hargaAfterTax * gramatur * ukuranPlanoCm) / 20000 / 500) *
        total_kertas;

      console.log(
        '=== NEW FORMULA CALCULATION (Art Paper/Ivory/Chromo/HVS) ===',
      );
      console.log('Kategori:', normalizedKategori);
      console.log(
        'Formula: ((harga_after_tax × gramatur × ukuran_plano_cm²) / 20000 / 500) × total_kertas',
      );
      console.log('---');
      console.log('Input Values:');
      console.log('  - Harga Original:', harga.toLocaleString('id-ID'));
      console.log('  - Pajak:', `${pajak}%`);
      console.log('  - Gramatur:', gramatur, 'g');
      console.log('  - Panjang:', panjang, 'mm =', panjangCm, 'cm');
      console.log('  - Lebar:', lebar, 'mm =', lebarCm, 'cm');
      console.log('  - Total Kertas:', total_kertas.toLocaleString('id-ID'));
      console.log('---');
      console.log('Calculation Steps:');
      console.log(
        `  Step 1: Calculate harga after tax = ${harga.toLocaleString(
          'id-ID',
        )} - (${harga.toLocaleString('id-ID')} × ${pajakPercentage})`,
      );
      console.log(
        `          Harga After Tax = ${hargaAfterTax.toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 2: Calculate ukuran plano = ${panjangCm} cm × ${lebarCm} cm`,
      );
      console.log(
        `          Ukuran Plano = ${ukuranPlanoCm.toLocaleString('id-ID')} cm²`,
      );
      console.log(
        `  Step 3: Multiply harga × gramatur = ${hargaAfterTax.toLocaleString(
          'id-ID',
        )} × ${gramatur}`,
      );
      console.log(
        `          Result = ${(hargaAfterTax * gramatur).toLocaleString(
          'id-ID',
        )}`,
      );
      console.log(
        `  Step 4: Multiply by ukuran plano = ${(
          hargaAfterTax * gramatur
        ).toLocaleString('id-ID')} × ${ukuranPlanoCm.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Result = ${(
          hargaAfterTax *
          gramatur *
          ukuranPlanoCm
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 5: Divide by 20000 = ${(
          hargaAfterTax *
          gramatur *
          ukuranPlanoCm
        ).toLocaleString('id-ID')} / 20000`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * gramatur * ukuranPlanoCm) /
          20000
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 6: Divide by 500 = ${(
          (hargaAfterTax * gramatur * ukuranPlanoCm) /
          20000
        ).toLocaleString('id-ID')} / 500`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * gramatur * ukuranPlanoCm) /
          20000 /
          500
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 7: Multiply by total kertas = ${(
          (hargaAfterTax * gramatur * ukuranPlanoCm) /
          20000 /
          500
        ).toLocaleString('id-ID')} × ${total_kertas.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Total Harga Kertas = ${total_harga_kertas.toLocaleString(
          'id-ID',
        )}`,
      );
      console.log('---');
      console.log(
        'Final Result:',
        Math.round(total_harga_kertas).toLocaleString('id-ID'),
      );
      console.log(
        '=================================================================\n',
      );
    } else if (normalizedKategori === 'Duplex Khusus') {
      // Formula Duplex Khusus: (((ukuran_jadi_area / plano_area) × harga × (percentageApki + 100)) / 100 / 500) × total_kertas
      isDuplexKhusus = true;
      const panjangCm = panjang / 10;
      const lebarCm = lebar / 10;
      const ukuranPlanoCm = panjangCm * lebarCm;

      const planoArea = 79 * 109; // 79cm x 109cm

      total_harga_kertas =
        (((ukuranPlanoCm / planoArea) * harga * (percentageApki + 100)) /
          100 /
          500) *
        total_kertas;

      console.log('=== DUPLEX KHUSUS FORMULA CALCULATION ===');
      console.log('Kategori:', normalizedKategori);
      console.log(
        'Formula: (((ukuran_jadi_area / plano_area) × harga × (percentageApki + 100)) / 100 / 500) × total_kertas',
      );
      console.log('---');
      console.log('Input Values:');
      console.log('  - Harga Original:', harga.toLocaleString('id-ID'));
      console.log('  - Pajak:', `${pajak}%`);
      console.log('  - Persentase Original:', persentase);
      console.log('  - PercentageApki:', percentageApki);
      console.log(
        '  - Ukuran Jadi Panjang:',
        formData.ukuran_jadi_panjang,
        'mm =',
        panjangCm,
        'cm',
      );
      console.log(
        '  - Ukuran Jadi Lebar:',
        formData.ukuran_jadi_lebar,
        'mm =',
        lebarCm,
        'cm',
      );
      console.log('  - Plano Area: 79 cm × 109 cm =', planoArea, 'cm²');
      console.log('  - Total Kertas:', total_kertas.toLocaleString('id-ID'));
      console.log('---');
      console.log('Calculation Steps:');
      console.log(
        `  Step 1: Calculate ukuran jadi area = ${panjangCm} cm × ${lebarCm} cm`,
      );
      console.log(
        `          Ukuran Jadi Area = ${ukuranPlanoCm.toLocaleString(
          'id-ID',
        )} cm²`,
      );
      console.log(
        `  Step 2: Divide by plano area = ${ukuranPlanoCm.toLocaleString(
          'id-ID',
        )} / ${planoArea.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Result = ${(ukuranPlanoCm / planoArea).toFixed(6)}`,
      );
      console.log(
        `  Step 3: Multiply by harga = ${(ukuranPlanoCm / planoArea).toFixed(
          6,
        )} × ${harga.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Result = ${(
          (ukuranPlanoCm / planoArea) *
          harga
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 4: Multiply by (percentageApki + 100) = ${(
          (ukuranPlanoCm / planoArea) *
          harga
        ).toLocaleString('id-ID')} × ${percentageApki + 100}`,
      );
      console.log(
        `          Result = ${(
          (ukuranPlanoCm / planoArea) *
          harga *
          (percentageApki + 100)
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 5: Divide by 100 = ${(
          (ukuranPlanoCm / planoArea) *
          harga *
          (percentageApki + 100)
        ).toLocaleString('id-ID')} / 100`,
      );
      console.log(
        `          Result = ${(
          ((ukuranPlanoCm / planoArea) * harga * (percentageApki + 100)) /
          100
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 6: Divide by 500 = ${(
          ((ukuranPlanoCm / planoArea) * harga * (percentageApki + 100)) /
          100
        ).toLocaleString('id-ID')} / 500`,
      );
      console.log(
        `          Result = ${(
          ((ukuranPlanoCm / planoArea) * harga * (percentageApki + 100)) /
          100 /
          500
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 7: Multiply by total kertas = ${(
          ((ukuranPlanoCm / planoArea) * harga * (percentageApki + 100)) /
          100 /
          500
        ).toLocaleString('id-ID')} × ${total_kertas.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Total Harga Kertas = ${total_harga_kertas.toLocaleString(
          'id-ID',
        )}`,
      );
      console.log('---');
      console.log(
        'Final Result:',
        Math.round(total_harga_kertas).toLocaleString('id-ID'),
      );
      console.log('==========================================\n');
    } else if (normalizedKategori === 'Duplex') {
      // Formula Duplex: ((harga_after_tax × (percentageApki + 100)) / 100 / 500) × total_kertas
      isDuplex = true;
      total_harga_kertas =
        ((harga * (percentageApki + 100)) / 100 / 500) * total_kertas;

      console.log('=== DUPLEX FORMULA CALCULATION ===');
      console.log('Kategori:', normalizedKategori);
      console.log(
        'Formula: ((harga_after_tax × (percentageApki + 100)) / 100 / 500) × total_kertas',
      );
      console.log('---');
      console.log('Input Values:');
      console.log('  - Harga Original:', harga.toLocaleString('id-ID'));
      console.log('  - Pajak:', `${pajak}%`);
      console.log('  - Persentase Original:', persentase);
      console.log('  - PercentageApki:', percentageApki);
      console.log('  - Total Kertas:', total_kertas.toLocaleString('id-ID'));
      console.log('---');
      console.log('Calculation Steps:');
      console.log(
        `  Step 1: Calculate harga after tax = ${harga.toLocaleString(
          'id-ID',
        )} - (${harga.toLocaleString('id-ID')} × ${pajakPercentage})`,
      );
      console.log(
        `          Harga After Tax = ${hargaAfterTax.toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 2: Calculate percentageApki + 100 = ${percentageApki} + 100`,
      );
      console.log(`          Result = ${percentageApki + 100}`);
      console.log(
        `  Step 3: Multiply harga × percentage = ${hargaAfterTax.toLocaleString(
          'id-ID',
        )} × ${percentageApki + 100}`,
      );
      console.log(
        `          Result = ${(
          hargaAfterTax *
          (percentageApki + 100)
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 4: Divide by 100 = ${(
          hargaAfterTax *
          (percentageApki + 100)
        ).toLocaleString('id-ID')} / 100`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * (percentageApki + 100)) /
          100
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 5: Divide by 500 = ${(
          (hargaAfterTax * (percentageApki + 100)) /
          100
        ).toLocaleString('id-ID')} / 500`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * (percentageApki + 100)) /
          100 /
          500
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 6: Multiply by total kertas = ${(
          (hargaAfterTax * (percentageApki + 100)) /
          100 /
          500
        ).toLocaleString('id-ID')} × ${total_kertas.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Total Harga Kertas = ${total_harga_kertas.toLocaleString(
          'id-ID',
        )}`,
      );
      console.log('---');
      console.log(
        'Final Result:',
        Math.round(total_harga_kertas).toLocaleString('id-ID'),
      );
      console.log('===================================\n');
    } else {
      // Default Formula: ((harga_after_tax × percentageApki) / 100 / 500) × total_kertas
      total_harga_kertas =
        ((harga * percentageApki) / 100 / 500) * total_kertas;

      console.log('=== DEFAULT FORMULA CALCULATION ===');
      console.log('Kategori:', normalizedKategori);
      console.log(
        'Formula: ((harga_after_tax × percentageApki) / 100 / 500) × total_kertas',
      );
      console.log('---');
      console.log('Input Values:');
      console.log('  - Harga Original:', harga.toLocaleString('id-ID'));
      console.log('  - Pajak:', `${pajak}%`);
      console.log('  - Persentase Original:', persentase);
      console.log('  - PercentageApki:', percentageApki);
      console.log('  - Total Kertas:', total_kertas.toLocaleString('id-ID'));
      console.log('---');
      console.log('Calculation Steps:');
      console.log(
        `  Step 1: Calculate harga after tax = ${harga.toLocaleString(
          'id-ID',
        )} - (${harga.toLocaleString('id-ID')} × ${pajakPercentage})`,
      );
      console.log(
        `          Harga After Tax = ${hargaAfterTax.toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 2: Multiply harga × percentageApki = ${hargaAfterTax.toLocaleString(
          'id-ID',
        )} × ${percentageApki}`,
      );
      console.log(
        `          Result = ${(hargaAfterTax * percentageApki).toLocaleString(
          'id-ID',
        )}`,
      );
      console.log(
        `  Step 3: Divide by 100 = ${(
          hargaAfterTax * percentageApki
        ).toLocaleString('id-ID')} / 100`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * percentageApki) /
          100
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 4: Divide by 500 = ${(
          (hargaAfterTax * percentageApki) /
          100
        ).toLocaleString('id-ID')} / 500`,
      );
      console.log(
        `          Result = ${(
          (hargaAfterTax * percentageApki) /
          100 /
          500
        ).toLocaleString('id-ID')}`,
      );
      console.log(
        `  Step 5: Multiply by total kertas = ${(
          (hargaAfterTax * percentageApki) /
          100 /
          500
        ).toLocaleString('id-ID')} × ${total_kertas.toLocaleString('id-ID')}`,
      );
      console.log(
        `          Total Harga Kertas = ${total_harga_kertas.toLocaleString(
          'id-ID',
        )}`,
      );
      console.log('---');
      console.log(
        'Final Result:',
        Math.round(total_harga_kertas).toLocaleString('id-ID'),
      );
      console.log('====================================\n');
    }

    const calculatedValue = Math.round(total_harga_kertas);
    const formattedValue = formatNumber(calculatedValue);

    // IMPORTANT: Only update if value actually changed
    const currentValue = parseFormattedNumber(
      formData.total_harga_kertas?.toString() || '0',
    );

    // Add tolerance check to prevent floating point issues
    if (Math.abs(calculatedValue - currentValue) >= 1) {
      const syntheticEvent = createSyntheticEvent(
        'total_harga_kertas',
        formattedValue,
      );
      onInputChange(syntheticEvent);
    }

    // For Duplex and Duplex Khusus: add 100 to percentageApki
    // For others: just use percentageApki
    const percentageDisplay =
      isDuplex || isDuplexKhusus ? percentageApki + 100 : percentageApki;
    const currentPercentage = parseFloat(
      formData.percentage?.toString() || '0',
    );

    // Only update if difference is significant
    if (Math.abs(percentageDisplay - currentPercentage) > 0.01) {
      const percentageSyntheticEvent = createSyntheticEvent(
        'percentage',
        percentageDisplay.toString(),
      );
      onInputChange(percentageSyntheticEvent);
    }
  }, [
    selectedBarangData,
    formData.total_kertas,
    formData.ukuran_jadi_panjang,
    formData.ukuran_jadi_lebar,
    onInputChange,
    formData.total_harga_kertas,
    formData.percentage,
    isReadOnly,
  ]);

  // Calculate Total Kertas automatically
  useEffect(() => {
    if (isReadOnly) return;

    const calculatetotal_kertas = () => {
      const qtyKalkulasi = parseFloat(
        formData.qty_kalkulasi?.toString() || '0',
      );
      const ukuranCetakBagian1 =
        parseFloat(formData.ukuran_cetak_bagian_1) || 0;
      const ukuranCetakIsi1 = parseFloat(formData.ukuran_cetak_isi_1) || 0;
      const ukuranCetakBagian2 =
        parseFloat(formData.ukuran_cetak_bagian_2) || 0;
      const ukuranCetakIsi2 = parseFloat(formData.ukuran_cetak_isi_2) || 0;
      const printInsheet = parseFloat(formData.print_insheet || '0') || 0;
      const ponsInsheet = parseFloat(formData.pons_insheet || '0') || 0;
      const finishingInsheet =
        parseFloat(formData.finishing_insheet || '0') || 0;
      const totalInsheet = printInsheet + ponsInsheet + finishingInsheet;

      const totalUkuranCetakIsi = ukuranCetakIsi1 + ukuranCetakIsi2;
      const totalUkuranCetakBagian = ukuranCetakBagian1 + ukuranCetakBagian2;

      if (
        qtyKalkulasi > 0 &&
        totalUkuranCetakIsi > 0 &&
        totalUkuranCetakBagian > 0
      ) {
        const total_kertas =
          (qtyKalkulasi / totalUkuranCetakIsi + totalInsheet) /
          totalUkuranCetakBagian;

        const calculatedValue = Math.ceil(total_kertas);
        const formattedValue = formatNumber(calculatedValue);

        const currentValue = parseFormattedNumber(
          formData.total_kertas?.toString() || '0',
        );
        if (calculatedValue !== currentValue) {
          const syntheticEvent = createSyntheticEvent(
            'total_kertas',
            formattedValue,
          );
          onInputChange(syntheticEvent);
        }
      }
    };

    calculatetotal_kertas();
  }, [
    formData.qty_kalkulasi,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_isi_1,
    formData.ukuran_cetak_bagian_2,
    formData.ukuran_cetak_isi_2,
    formData.print_insheet,
    formData.pons_insheet,
    formData.finishing_insheet,
    onInputChange,
    formData.total_kertas,
    isReadOnly,
  ]);

  // Auto-fill fields when Nama Kertas is selected
  const autoFillFields = (selectedBarang: BarangResponse) => {
    if (isReadOnly) return;

    setSelectedBarangData(selectedBarang);

    onInputChange(
      createSyntheticEvent('gramature', selectedBarang.gramatur || 0),
    );

    onInputChange(
      createSyntheticEvent('panjangMm', selectedBarang.panjang || 0),
    );

    onInputChange(createSyntheticEvent('lebarMm', selectedBarang.lebar || 0));

    onInputChange(
      createSyntheticEvent(
        'rawPercentage',
        selectedBarang.persentase.toFixed(2),
      ),
    );

    const percentageApki = calculatePercentageApki(
      selectedBarang.persentase,
      selectedBarang.pajak,
    );

    // Check if it's Duplex or Duplex Khusus
    const normalizedKategori = selectedBarang.kategori.trim();
    const isDuplexOrDuplexKhusus =
      normalizedKategori === 'Duplex' || normalizedKategori === 'Duplex Khusus';

    // For Duplex and Duplex Khusus: add 100, for others: just percentageApki
    const finalPercentage = isDuplexOrDuplexKhusus
      ? percentageApki + 100
      : percentageApki;

    onInputChange(
      createSyntheticEvent('percentage', finalPercentage.toString()),
    );
  };

  const handleJenisKertasChange = (value: number | string) => {
    if (isReadOnly) return;

    setSelectedJenisKertas(value.toString());

    const jenisKertasEvent = {
      target: {
        name: 'jenis_kertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(jenisKertasEvent);

    // Reset nama kertas when jenis kertas changes
    setSelectedNamaKertas(0);
    const namaKertasEvent = {
      target: {
        name: 'id_kertas',
        value: '',
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(namaKertasEvent);

    setSelectedBarangData(null);

    // Clear auto-filled fields
    onInputChange(createSyntheticEvent('gramature', ''));
    onInputChange(createSyntheticEvent('panjangMm', ''));
    onInputChange(createSyntheticEvent('lebarMm', ''));
    onInputChange(createSyntheticEvent('rawPercentage', ''));
    onInputChange(createSyntheticEvent('percentage', ''));
    onInputChange(createSyntheticEvent('total_harga_kertas', ''));
  };

  const handleNamaKertasChange = (value: number | string) => {
    if (isReadOnly) return;

    setSelectedNamaKertas(Number(value));

    const namaKertasEvent = {
      target: {
        name: 'id_kertas',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(namaKertasEvent);

    const selectedBarang = namaKertasData.find(
      (item) => item.id === Number(value),
    );
    if (selectedBarang) {
      autoFillFields(selectedBarang);
    }
  };

  const handleMesinPotongChange = (value: number | string) => {
    if (isReadOnly) return;

    setSelectedMesinPotong(Number(value));

    const syntheticEvent = {
      target: {
        name: 'id_mesin_potong',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('Debug Mesin Potong:', {
      formDataMesinPotong: formData.id_mesin_potong,
      selectedMesinPotong,
      mesinPotongOptions: mesinPotongOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
      optionsLoaded: mesinPotongOptions.length > 0,
    });
  }, [formData.id_mesin_potong, selectedMesinPotong, mesinPotongOptions]);

  const handleInputChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    onInputChange(e);
  };

  return (
    <div className="space-y-6">
      {/* Pre-Press & Press Section */}
      <div>
        <h3
          className={`text-lg font-semibold mb-6 flex items-center ${getSectionHeaderColor()}`}
        >
          📋 Pre-Press & Press
          {isReadOnly && (
            <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
              View Only
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jenis Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kertas
            </label>
            <SearchableSelect
              options={jenisKertasOptions}
              value={selectedJenisKertas}
              onChange={handleJenisKertasChange}
              placeholder={
                isLoadingJenisKertas ? 'Loading...' : '--Pilih Jenis Kertas--'
              }
              className="w-full"
              required
              disabled={isReadOnly}
            />
          </div>

          {/* Nama Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kertas
            </label>
            <SearchableSelect
              options={namaKertasOptions}
              value={selectedNamaKertas}
              onChange={handleNamaKertasChange}
              placeholder={
                !selectedJenisKertas
                  ? 'Pilih jenis kertas'
                  : isLoadingNamaKertas
                  ? 'Loading...'
                  : 'Pilih Nama Kertas'
              }
              className="w-full"
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Mark Jenis Kertas - Hide in readonly mode */}
        {!isReadOnly && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Pilih
            </button>
          </div>
        )}
      </div>

      {/* Paper Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Gramature */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gramature
          </label>
          <input
            type="number"
            name="gramature"
            value={formData.gramature || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Panjang mm */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Panjang mm
          </label>
          <input
            type="number"
            name="panjangMm"
            value={formData.panjangMm || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Lebar mm */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lebar mm
          </label>
          <input
            type="number"
            name="lebarMm"
            value={formData.lebarMm || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Raw Percentage */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage
            <span className="text-xs text-gray-500 block">
              (Original Value)
            </span>
          </label>
          <input
            type="number"
            name="rawPercentage"
            value={formData.rawPercentage || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Percentage%Apki */}
        <div className="flex flex-col justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percentage%Apki
            <span className="text-xs text-gray-500 block">
              ({formData.rawPercentage} / {selectedBarangData?.pajak}%
              {selectedBarangData?.kategori?.trim() === 'Duplex' ||
              selectedBarangData?.kategori?.trim() === 'Duplex Khusus'
                ? ' + 100'
                : ''}
              )
            </span>
          </label>
          <input
            type="number"
            name="percentage"
            value={formData.percentage || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            )}
            placeholder="0"
            readOnly
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Kertas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Kertas
            <span className="text-xs text-gray-500 ml-2">
              (Auto-calculated)
            </span>
          </label>
          <input
            type="text"
            name="total_kertas"
            value={formData.total_kertas || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Total Harga Kertas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Harga Kertas
            <span className="text-xs text-gray-500 ml-2">
              (Auto-calculated)
            </span>
          </label>
          <input
            type="text"
            name="total_harga_kertas"
            value={formData.total_harga_kertas || ''}
            onChange={handleInputChangeLocal}
            className={getInputClassName(
              'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50',
            )}
            placeholder="0"
            readOnly
          />
        </div>

        {/* Mesin Potong */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesin Potong
          </label>
          <SearchableSelect
            options={mesinPotongOptions}
            value={selectedMesinPotong}
            onChange={handleMesinPotongChange}
            placeholder={
              isLoadingMesinPotong ? 'Loading...' : 'Pilih Mesin Potong'
            }
            className="w-full"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Readonly Information Panel */}
      {isReadOnly && selectedBarangData && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            Detail Kertas Terpilih
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Jenis:</span>
              <div className="text-blue-800">{selectedBarangData.kategori}</div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Nama:</span>
              <div className="text-blue-800">
                {selectedBarangData.nama_barang}
              </div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Gramatur:</span>
              <div className="text-blue-800">
                {selectedBarangData.gramatur}g
              </div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Ukuran:</span>
              <div className="text-blue-800">
                {selectedBarangData.panjang} × {selectedBarangData.lebar} mm
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepressTab;
