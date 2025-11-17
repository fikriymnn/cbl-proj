// utils/calculations.ts
import { KalkulasiFormData } from '../types/kalkulasi';

// Helper function to parse currency strings to numbers
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

// Calculate total production cost (Harga Produksi)
export const calculateHargaProduksi = (formData: KalkulasiFormData): number => {
  const fields = [
    parseCurrencyString(formData.total_harga_kertas),
    parseCurrencyString(formData.jumlah_harga_cetak),
    parseCurrencyString(formData.total_harga_coating),
    parseCurrencyString(formData.total_harga_ongkos_pons),
    parseCurrencyString(formData.harga_pisau),
    parseCurrencyString(formData.harga_lipat),
    parseCurrencyString(formData.harga_potong_jadi),
    parseCurrencyString(formData.jumlah_harga_lem),
    parseCurrencyString(formData.harga_foil_manual),
    parseCurrencyString(formData.harga_spot_foil_manual),
    parseCurrencyString(formData.harga_polimer_manual),
    parseCurrencyString(formData.harga_plate),
    parseCurrencyString(formData.harga_packaging),
    parseCurrencyString(formData.harga_packing),
    parseCurrencyString(formData.harga_pengiriman),
    parseCurrencyString(formData.total_harga_lain_lain),
  ];

  const total = fields.reduce((sum, value) => sum + value, 0);
  return total;
};

// Calculate total from lain-lain items
export const calculateLainLainTotal = (
  lainLain?: Array<{ nama_item: string; harga: number }>,
): number => {
  if (!lainLain || lainLain.length === 0) return 0;

  return lainLain.reduce((total, item) => {
    return total + (parseCurrencyString(item.harga) || 0);
  }, 0);
};

// Calculate all financial data (profit, PPN, discount, total)
export const calculateFinancialData = (formData: KalkulasiFormData) => {
  const hargaProduksi = parseCurrencyString(formData.harga_produksi);
  const profitPercentage = parseCurrencyString(formData.profit);
  const ppnPercentage = parseCurrencyString(formData.ppn);
  const diskonPercentage = parseCurrencyString(formData.diskon);
  const qty = parseCurrencyString(formData.qty_kalkulasi);

  // Step 1: Calculate Profit Amount = Harga Produksi * (Profit% / 100)
  const profitAmount = hargaProduksi * (profitPercentage / 100);

  // Step 2: Calculate Harga Jual = Harga Produksi + Profit Amount
  const hargaJual = hargaProduksi + profitAmount;

  // Step 3: Calculate PPN = Harga Jual * (PPN% / 100)
  const hargaPpn = hargaJual * (ppnPercentage / 100);

  // Step 4: Calculate Discount = (Harga Jual + PPN) * (Discount% / 100)
  const subtotalBeforeDiscount = hargaJual + hargaPpn;
  const hargaDiskon = subtotalBeforeDiscount * (diskonPercentage / 100);

  // Step 5: Calculate Total = Harga Jual + PPN - Discount
  const totalHarga = hargaJual + hargaPpn - hargaDiskon;

  // Step 6: Calculate per unit price
  const hargaSatuan = qty > 0 ? totalHarga / qty : 0;

  return {
    harga_produksi: hargaProduksi,
    profit_harga: profitAmount,
    jumlah_harga_jual: hargaJual,
    harga_ppn: hargaPpn,
    harga_diskon: hargaDiskon,
    total_harga: totalHarga,
    harga_satuan: hargaSatuan,
  };
};

// Fields that affect production cost calculation
export const PRODUCTION_COST_FIELDS = [
  'total_harga_kertas',
  'jumlah_harga_cetak',
  'jumlah_harga_coating_depan',
  'jumlah_harga_coating_belakang',
  'total_harga_coating',
  'total_harga_ongkos_pons',
  'harga_pisau',
  'harga_packaging',
  'harga_pengiriman',
  'harga_lipat',
  'harga_potong_jadi',
  'jumlah_harga_lem',
  'harga_foil_manual',
  'harga_spot_foil_manual',
  'harga_polimer_manual',
  'harga_plate',
  'harga_packing',
  'lain_lain',
  'total_harga_lain_lain',
];

// Fields that affect financial calculations (profit, PPN, discount, total)
export const FINANCIAL_FIELDS = [
  'harga_produksi',
  'profit',
  'ppn',
  'diskon',
  'qty_kalkulasi',
];
