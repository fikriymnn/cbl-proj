// utils/insheetCalculation.ts
// Single source of truth for both the "1 ukuran cetak" and "2 ukuran cetak" formulas.
//
// NOTE: the dual (2 ukuran) formula below was verified step-by-step against the
// user's reference images:
//   Image 1: Qty LP = QtyPO / (BagianA*IsiA + BagianB*IsiB)
//   Image 2: Insheet(LP) = ceil(ketentuan(qtyLP) / min(BagianA,BagianB))
//            Kebutuhan LP = QtyLP + InsheetLP
//            Druk[side] = KebutuhanLP * Bagian[side]
//            Insheet[side] = InsheetLP * Bagian[side]
//   Image 3: Cetak/Pond/Finishing insheet per side = splitByProcess(Insheet[side], prosesData)
// All of these match 1:1 with QtyPO=100.000, A(3,6), B(2,4) -> 3.846 / 200 / 4.046 /
// 12.138+8.092 / 600+400 / (300,90,210)+(200,60,140).

export interface InsheetSideSplit {
  bagian: number;
  isi: number;
  jumlah_druk: number; // druk needed for this side (incl. insheet)
  total_insheet: number; // insheet needed for this side
  cetak: number;
  pond: number;
  finishing: number;
}

export interface InsheetValues {
  jumlah_druk: number; // aggregate (A+B, or single)
  jumlah_insheet_cetak: number; // aggregate
  jumlah_insheet_pond: number; // aggregate
  jumlah_insheet_finishing: number; // aggregate
  total_insheet: number; // aggregate
  jumlah_lp: number;
  formula_mode: 'single' | 'dual';
  qty_lp_raw: number; // raw LP/druk before insheet — needed for manual-edit reverse formula
  split?: { a: InsheetSideSplit; b: InsheetSideSplit }; // only present when formula_mode === 'dual'
}

export const emptyInsheetValues = (): InsheetValues => ({
  jumlah_druk: 0,
  jumlah_insheet_cetak: 0,
  jumlah_insheet_pond: 0,
  jumlah_insheet_finishing: 0,
  total_insheet: 0,
  jumlah_lp: 0,
  formula_mode: 'single',
  qty_lp_raw: 0,
});

/** A mounting is "2 ukuran" the moment it has a real bagian B + isi B. */
export const isDualUkuran = (mounting: any): boolean =>
  !!(mounting?.ukuran_cetak_bagian_2 && mounting?.ukuran_cetak_isi_2);

const getKetentuan = (basis: number, data: any[]) => {
  const found = data.find((k) => {
    const low = parseInt(k.batas_bawah);
    const high = k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
    return basis >= low && basis <= high;
  });
  return found || { nilai: 0, is_persentase: false };
};

/**
 * Splits an insheet total across Cetak / Pond / Finishing according to the
 * proses-insheet percentages (persentase_insheet) configured in master data.
 * Exported so JOPrintModal (and anything else needing per-side process
 * breakdown, e.g. image 3's Sisi A / Sisi B tables) can reuse the exact same
 * logic used when the JO was created/edited.
 */
export const splitByProcess = (total: number, prosesData: any[]) => {
  const totalPct =
    prosesData.reduce((s, p) => s + p.persentase_insheet, 0) || 1;
  let cetak = 0,
    pond = 0,
    finishing = 0;
  prosesData.forEach((p) => {
    const value = Math.ceil((total * p.persentase_insheet) / totalPct);
    const name = p.proses.toUpperCase();
    if (name === 'CETAK') cetak = value;
    else if (['POND', 'PONDS', 'PONDING'].includes(name)) pond = value;
    else if (name === 'FINISHING') finishing = value;
  });
  return { cetak, pond, finishing };
};

/** Forward formula: from Qty -> everything else. */
export const calculateInsheetFromQty = (
  qty: number,
  mounting: any,
  ketentuanData: any[],
  prosesData: any[],
): InsheetValues => {
  const bagianA = mounting.ukuran_cetak_bagian_1 || 1;
  const isiA = mounting.ukuran_cetak_isi_1 || 0;
  const bagianB = mounting.ukuran_cetak_bagian_2 || 0;
  const isiB = mounting.ukuran_cetak_isi_2 || 0;
  const dual = isDualUkuran(mounting);

  if (!dual) {
    // ── legacy single-ukuran formula (unchanged) ──
    const totalIsi = isiA + isiB || 1;
    const rawJumlahDruk = Math.ceil(qty / totalIsi);
    const ketentuan = getKetentuan(rawJumlahDruk, ketentuanData);
    const ketentuanValue = ketentuan.is_persentase
      ? (rawJumlahDruk * ketentuan.nilai) / 100
      : ketentuan.nilai;
    const totalInsheet = Math.ceil(ketentuanValue);
    const { cetak, pond, finishing } = splitByProcess(totalInsheet, prosesData);
    const displayedDruk = rawJumlahDruk + totalInsheet;
    const jumlahLP = Math.ceil(displayedDruk / bagianA);

    return {
      jumlah_druk: displayedDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalInsheet,
      jumlah_lp: jumlahLP,
      formula_mode: 'single',
      qty_lp_raw: rawJumlahDruk,
    };
  }

  // ── dual-ukuran formula (verified against images 1 & 2) ──
  // 1) Qty LP = Qty / (BagianA*IsiA + BagianB*IsiB)
  const totalIsiPerLP = bagianA * isiA + bagianB * isiB || 1;
  const qtyLP = qty / totalIsiPerLP;

  // 2) ketentuan insheet looked up on the raw LP requirement
  const ketentuan = getKetentuan(Math.ceil(qtyLP), ketentuanData);
  const ketentuanValue = ketentuan.is_persentase
    ? (qtyLP * ketentuan.nilai) / 100
    : ketentuan.nilai;
  const totalInsheetRaw = Math.ceil(ketentuanValue);

  // 3) insheet, expressed as LP, taken from the SMALLEST bagian
  const smallerBagian = Math.min(bagianA, bagianB) || 1;
  const insheetLP = Math.ceil(totalInsheetRaw / smallerBagian);

  // 4) Kebutuhan LP = Qty LP + Insheet LP
  const kebutuhanLP = Math.round(qtyLP + insheetLP);

  // 5) Keperluan Druk / Insheet per side = kebutuhan/insheet LP * bagian sisi
  const drukA = kebutuhanLP * bagianA;
  const drukB = kebutuhanLP * bagianB;
  const insheetA = insheetLP * bagianA;
  const insheetB = insheetLP * bagianB;

  const procA = splitByProcess(insheetA, prosesData);
  const procB = splitByProcess(insheetB, prosesData);

  return {
    jumlah_druk: drukA + drukB,
    jumlah_insheet_cetak: procA.cetak + procB.cetak,
    jumlah_insheet_pond: procA.pond + procB.pond,
    jumlah_insheet_finishing: procA.finishing + procB.finishing,
    total_insheet: insheetA + insheetB,
    jumlah_lp: kebutuhanLP,
    formula_mode: 'dual',
    qty_lp_raw: qtyLP,
    split: {
      a: {
        bagian: bagianA,
        isi: isiA,
        jumlah_druk: drukA,
        total_insheet: insheetA,
        ...procA,
      },
      b: {
        bagian: bagianB,
        isi: isiB,
        jumlah_druk: drukB,
        total_insheet: insheetB,
        ...procB,
      },
    },
  };
};

/**
 * Reverse formula for the manual "edit total insheet" field.
 * - single mode: newValue is the raw total-insheet count (unchanged behaviour).
 * - dual mode: newValue is Insheet expressed in LP (matches the "Insheet (LP)" field shown to the user).
 */
export const applyManualTotalInsheet = (
  newValue: number,
  mounting: any,
  current: InsheetValues,
  prosesData: any[],
): InsheetValues => {
  const bagianA = mounting.ukuran_cetak_bagian_1 || 1;
  const isiA = mounting.ukuran_cetak_isi_1 || 0;
  const bagianB = mounting.ukuran_cetak_bagian_2 || 0;
  const isiB = mounting.ukuran_cetak_isi_2 || 0;
  const dual = isDualUkuran(mounting);

  if (!dual) {
    const { cetak, pond, finishing } = splitByProcess(newValue, prosesData);
    const displayedDruk = current.qty_lp_raw + newValue;
    const jumlahLP = Math.ceil(displayedDruk / bagianA);
    return {
      jumlah_druk: displayedDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: newValue,
      jumlah_lp: jumlahLP,
      formula_mode: 'single',
      qty_lp_raw: current.qty_lp_raw,
    };
  }

  const insheetLP = newValue;
  const kebutuhanLP = Math.round(current.qty_lp_raw + insheetLP);
  const drukA = kebutuhanLP * bagianA;
  const drukB = kebutuhanLP * bagianB;
  const insheetA = insheetLP * bagianA;
  const insheetB = insheetLP * bagianB;
  const procA = splitByProcess(insheetA, prosesData);
  const procB = splitByProcess(insheetB, prosesData);

  return {
    jumlah_druk: drukA + drukB,
    jumlah_insheet_cetak: procA.cetak + procB.cetak,
    jumlah_insheet_pond: procA.pond + procB.pond,
    jumlah_insheet_finishing: procA.finishing + procB.finishing,
    total_insheet: insheetA + insheetB,
    jumlah_lp: kebutuhanLP,
    formula_mode: 'dual',
    qty_lp_raw: current.qty_lp_raw,
    split: {
      a: {
        bagian: bagianA,
        isi: isiA,
        jumlah_druk: drukA,
        total_insheet: insheetA,
        ...procA,
      },
      b: {
        bagian: bagianB,
        isi: isiB,
        jumlah_druk: drukB,
        total_insheet: insheetB,
        ...procB,
      },
    },
  };
};

/** Derives Qty back from a (possibly manually-edited) InsheetValues object. */
export const deriveQtyFromInsheet = (
  mounting: any,
  values: InsheetValues,
): number => {
  const isiA = mounting.ukuran_cetak_isi_1 || 0;
  const isiB = mounting.ukuran_cetak_isi_2 || 0;
  if (values.formula_mode === 'dual') {
    const bagianA = mounting.ukuran_cetak_bagian_1 || 1;
    const bagianB = mounting.ukuran_cetak_bagian_2 || 0;
    const totalIsiPerLP = bagianA * isiA + bagianB * isiB || 1;
    return values.jumlah_lp * totalIsiPerLP;
  }
  const totalIsi = isiA + isiB || 1;
  return values.jumlah_druk * totalIsi;
};
