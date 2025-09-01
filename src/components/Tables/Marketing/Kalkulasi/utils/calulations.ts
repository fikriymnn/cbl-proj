// utils/calculations.ts
import { KalkulasiFormData } from '../KalkulasiModal';

// utils/calculations.ts
const parseCurrencyString = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;

  let cleanValue = value.toString().trim();

  // Remove 'Rp' and spaces first
  cleanValue = cleanValue.replace(/Rp\s*/g, '');

  // Handle specific formats from your console:
  // "8.395.625" -> 8395625
  // "175.000,00" -> 175000
  // "80.000,00" -> 80000
  // "731250" -> 731250

  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // European format like "175.000,00"
    const lastCommaIndex = cleanValue.lastIndexOf(',');
    const lastDotIndex = cleanValue.lastIndexOf('.');

    if (lastCommaIndex > lastDotIndex) {
      // Dots are thousand separators, comma is decimal
      // "175.000,00" -> "175000.00"
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Commas are thousand separators, dot is decimal
      // "8,395.625" -> "8395.625"
      cleanValue = cleanValue.replace(/,/g, '');
    }
  } else if (cleanValue.includes('.')) {
    // Only dots - determine if thousand separator or decimal
    const parts = cleanValue.split('.');

    // If more than 2 parts OR last part has exactly 3 digits, treat as thousand separator
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // "8.395.625" or "175.000" -> remove all dots
      cleanValue = cleanValue.replace(/\./g, '');
    }
    // Otherwise keep as decimal: "123.45" stays "123.45"
  } else if (cleanValue.includes(',')) {
    // Only commas
    const parts = cleanValue.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal separator: "175,00" -> "175.00"
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Thousand separator: remove commas
      cleanValue = cleanValue.replace(/,/g, '');
    }
  }

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateHargaProduksi = (formData: KalkulasiFormData): number => {
  const fields = [
    parseCurrencyString(formData.totalHargaKertas), // 8.395.625 -> 8395625
    parseCurrencyString(formData.jumlah_harga_cetak), // 731250 -> 731250
    parseCurrencyString(formData.total_harga_coating), // 400000 -> 400000
    parseCurrencyString(formData.total_harga_ongkos_pons), // 175.000,00 -> 175000
    parseCurrencyString(formData.harga_pisau), // Should be parsed correctly
    parseCurrencyString(formData.harga_lipat), // 80.000,00 -> 80000
    parseCurrencyString(formData.harga_potong_jadi), // 25.000,00 -> 25000
    parseCurrencyString(formData.jumlah_harga_lem), // 150.000,00 -> 150000
    parseCurrencyString(formData.harga_foil_manual), // Should be parsed correctly
    parseCurrencyString(formData.harga_spot_foil_manual), // Should be parsed correctly
    parseCurrencyString(formData.harga_polimer_manual), // Should be parsed correctly
    parseCurrencyString(formData.harga_plate),
  ];

  console.log('Individual parsed values:', fields);
  const total = fields.reduce((total, value) => total + value, 0);
  console.log('Total Harga Produksi:', total);

  return total;
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
