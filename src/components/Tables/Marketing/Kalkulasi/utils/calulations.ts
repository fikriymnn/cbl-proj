// utils/calculations.ts
import { KalkulasiFormData } from '../types/kalkulasi';

// Improved helper function to parse currency strings to numbers
const parseCurrencyString = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;

  let cleanValue = value.toString().trim();

  // Remove 'Rp' and spaces
  cleanValue = cleanValue.replace(/Rp\s*/g, '');

  // Count dots and commas to determine format
  const dotCount = (cleanValue.match(/\./g) || []).length;
  const commaCount = (cleanValue.match(/,/g) || []).length;

  // Multiple dots = thousand separator (Indonesian format: 1.000.000)
  if (dotCount > 1) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }

  // Multiple commas = thousand separator (US format: 1,000,000)
  if (commaCount > 1) {
    cleanValue = cleanValue.replace(/,/g, '');
    return parseFloat(cleanValue) || 0;
  }

  // Has both comma and dot
  if (dotCount === 1 && commaCount === 1) {
    const dotPos = cleanValue.indexOf('.');
    const commaPos = cleanValue.indexOf(',');

    if (commaPos > dotPos) {
      // Format: 1.000,50 (European/Indonesian)
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // Format: 1,000.50 (US)
      cleanValue = cleanValue.replace(/,/g, '');
    }
    return parseFloat(cleanValue) || 0;
  }

  // Single dot - check position to determine if thousand separator or decimal
  if (dotCount === 1) {
    const parts = cleanValue.split('.');
    // If last part is exactly 3 digits and first part is <= 3 digits, likely thousand separator
    // e.g., "2.000" but not "12.345" (which could be decimal)
    if (parts[1].length === 3 && parts[0].length <= 3) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
    // Otherwise treat as decimal
    return parseFloat(cleanValue) || 0;
  }

  // Single comma - check if it's decimal separator
  if (commaCount === 1) {
    const parts = cleanValue.split(',');
    if (parts[1].length <= 2) {
      // Decimal separator: "1000,50"
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Thousand separator: "1,000"
      cleanValue = cleanValue.replace(/,/g, '');
    }
    return parseFloat(cleanValue) || 0;
  }

  // No separators - just parse
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

  // Optional: Add debug logging for suspicious values
  if (total > 10000000000) {
    // 10 billion
    console.warn('Suspicious large production cost:', {
      total,
      breakdown: {
        total_harga_kertas: parseCurrencyString(formData.total_harga_kertas),
        jumlah_harga_cetak: parseCurrencyString(formData.jumlah_harga_cetak),
        total_harga_coating: parseCurrencyString(formData.total_harga_coating),
        total_harga_ongkos_pons: parseCurrencyString(
          formData.total_harga_ongkos_pons,
        ),
        harga_pisau: parseCurrencyString(formData.harga_pisau),
        harga_lipat: parseCurrencyString(formData.harga_lipat),
        harga_potong_jadi: parseCurrencyString(formData.harga_potong_jadi),
        jumlah_harga_lem: parseCurrencyString(formData.jumlah_harga_lem),
        harga_foil_manual: parseCurrencyString(formData.harga_foil_manual),
        harga_spot_foil_manual: parseCurrencyString(
          formData.harga_spot_foil_manual,
        ),
        harga_polimer_manual: parseCurrencyString(
          formData.harga_polimer_manual,
        ),
        harga_plate: parseCurrencyString(formData.harga_plate),
        harga_packaging: parseCurrencyString(formData.harga_packaging),
        harga_packing: parseCurrencyString(formData.harga_packing),
        harga_pengiriman: parseCurrencyString(formData.harga_pengiriman),
        total_harga_lain_lain: parseCurrencyString(
          formData.total_harga_lain_lain,
        ),
      },
    });
  }

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
