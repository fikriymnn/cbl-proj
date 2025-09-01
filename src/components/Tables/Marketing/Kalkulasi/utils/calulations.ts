// utils/calculations.ts
import { KalkulasiFormData } from '../KalkulasiModal';

// Enhanced function to parse various currency and number formats
const parseCurrencyString = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;

  let cleanValue = value.toString();

  // Remove 'Rp' and spaces first
  cleanValue = cleanValue.replace(/Rp\s*/g, '');

  // Handle different number formats
  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Format like "175.000,00" (European style) - dots for thousands, comma for decimal
    if (cleanValue.lastIndexOf(',') > cleanValue.lastIndexOf('.')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    // Format like "8,395.625" (US style) - commas for thousands, dot for decimal
    else {
      cleanValue = cleanValue.replace(/,/g, '');
    }
  } else if (cleanValue.includes('.')) {
    // Check if it's likely a thousand separator or decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // Multiple dots or last part has 3 digits = thousand separators
      cleanValue = cleanValue.replace(/\./g, '');
    }
  } else if (cleanValue.includes(',')) {
    // Only commas - could be thousand separator or decimal
    const parts = cleanValue.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Likely thousand separator
      cleanValue = cleanValue.replace(/,/g, '');
    }
  }

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateHargaProduksi = (formData: KalkulasiFormData): number => {
  const fields = [
    parseCurrencyString(formData.totalHargaKertas),
    parseCurrencyString(formData.jumlah_harga_cetak),
    parseCurrencyString(formData.jumlah_harga_coating_depan),
    parseCurrencyString(formData.jumlah_harga_coating_belakang),
    parseCurrencyString(formData.total_harga_coating),
    parseCurrencyString(formData.total_harga_ongkos_pons),
    parseCurrencyString(formData.harga_pisau),
    parseCurrencyString(formData.harga_lipat),
    parseCurrencyString(formData.harga_potong_jadi),
    parseCurrencyString(formData.jumlah_harga_lem),
    parseCurrencyString(formData.harga_foil_manual),
    parseCurrencyString(formData.harga_spot_foil_manual),
    parseCurrencyString(formData.harga_polimer_manual),
  ];

  return fields.reduce((total, value) => total + value, 0);
};

// utils/calculations.ts
export const calculateFinancialData = (formData: KalkulasiFormData) => {
  const hargaProduksi = parseCurrencyString(formData.harga_produksi);
  const profitPercentage = parseCurrencyString(formData.profit_harga);
  const ppnPercentage = parseCurrencyString(formData.ppn);
  const diskonPercentage = parseCurrencyString(formData.diskon);
  const qty = parseCurrencyString(formData.qty_kalkulasi);

  // Step 1: Calculate Harga Jual = Harga Produksi + (Harga Produksi * Profit%)
  const profitAmount = hargaProduksi * (profitPercentage / 100);
  const hargaJual = hargaProduksi + profitAmount;

  // Step 2: Calculate PPN = Harga Jual * PPN%
  const hargaPpn = hargaJual * (ppnPercentage / 100);

  // Step 3: Calculate Discount = (Harga Jual + PPN) * Discount%
  const subtotalBeforeDiscount = hargaJual + hargaPpn;
  const hargaDiskon = subtotalBeforeDiscount * (diskonPercentage / 100);

  // Step 4: Calculate Total = Harga Jual + PPN - Discount
  const totalHarga = hargaJual + hargaPpn - hargaDiskon;

  // Step 5: Calculate per unit price
  const hargaSatuan = qty > 0 ? totalHarga / qty : 0;

  return {
    harga_produksi: hargaProduksi,
    jumlah_harga_jual: hargaJual,
    harga_ppn: hargaPpn,
    harga_diskon: hargaDiskon,
    total_harga: totalHarga,
    harga_satuan: hargaSatuan,
    total_harga_satuan_customer: hargaSatuan,
  };
};

// Fields that affect production cost
export const PRODUCTION_COST_FIELDS = [
  'totalHargaKertas',
  'jumlah_harga_cetak',
  'jumlah_harga_coating_depan',
  'jumlah_harga_coating_belakang',
  'total_harga_coating',
  'total_harga_ongkos_pons',
  'harga_pisau',
  'harga_lipat',
  'harga_potong_jadi',
  'jumlah_harga_lem',
  'harga_foil_manual',
  'harga_spot_foil_manual',
  'harga_polimer_manual',
];

// Fields that affect financial calculations
export const FINANCIAL_FIELDS = [
  'harga_produksi',
  'profit_harga',
  'ppn',
  'diskon',
  'qty_kalkulasi',
];
