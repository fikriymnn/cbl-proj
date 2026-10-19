import * as XLSX from 'xlsx';
import convertTimeStampToDate from '../../../../utils/convertDate';

type Mode = 'waste' | 'kendala';
type Row = (string | number | null | undefined)[];

export const PROSES_LIST = [
  'POTONG',
  'CETAK',
  'COATING',
  'POND',
  'LEM',
  'LIPAT',
];

export const PROSES_SECTIONS = [
  { key: 'sortir_RS', label: 'SORTIR RS' },
  { key: 'sampling_rabut', label: 'SAMPLING RABUT' },
  { key: 'ampar_lem', label: 'AMPAR LEM' },
  { key: 'helper', label: 'TEMUAN HELPER' },
];

/* ----------------------------- Helpers umum ----------------------------- */

export const dash = (v: any) =>
  v === undefined || v === null || v === '' ? '-' : v;

const num = (v: any) => Number(v ?? 0);

export const formatTemuan = (t?: string) =>
  t
    ? t
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '-';

export const formatTanggal = (v: any) => {
  if (!v) return '-';
  try {
    return convertTimeStampToDate(v) || '-';
  } catch {
    return '-';
  }
};

export const hasContent = (item: any) =>
  item && typeof item === 'object' && Object.keys(item).length > 0;

export const cleanList = (list: any): any[] =>
  Array.isArray(list) ? (list as any[]).flat().filter(hasContent) : [];

export const getUniqueVerifikator = (list: any): any[] => {
  const seen = new Set<string>();
  return cleanList(list).filter((item) => {
    const key = `${item.kode_mr}-${item.tanggal_tiket}-${item.inspektor_mtc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const sortDesc = (arr: any[], field: string) =>
  [...(arr || [])].sort((a, b) => num(b[field]) - num(a[field]));

function appendSheet(
  wb: XLSX.WorkBook,
  name: string,
  headers: string[],
  rows: Row[],
) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h, c) => {
    let max = h.length;
    rows.forEach((r) => {
      const len = String(r[c] ?? '').length;
      if (len > max) max = len;
    });
    return { wch: Math.min(60, max + 2) };
  });
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

function save(wb: XLSX.WorkBook, base: string, from: any, to: any) {
  XLSX.writeFile(wb, `${base}_${from ?? 'all'}_${to ?? 'all'}.xlsx`);
}

/* ------------------------- Export By JO (Waste/Kendala) ------------------------- */

function buildByJo(mode: Mode, list: any[]) {
  const isWaste = mode === 'waste';
  const wb = XLSX.utils.book_new();

  const listRows: Row[] = [];
  const prosesRows: Row[] = [];
  const mainRows: Row[] = [];
  const verifRows: Row[] = [];
  const opRows: Row[] = [];
  const nestedRows: Row[] = [];

  (list || []).forEach((jo, idx) => {
    const noJo = jo.no_jo;

    // Sheet 1: List JO
    listRows.push([
      idx + 1,
      jo.no_jo,
      jo.no_io,
      jo.customer,
      jo.nama_produk,
      ...PROSES_LIST.map((p) => num(jo.defectsByKategori?.[p]?.total_defect)),
      num(jo.total_defect),
    ]);

    // Sheet 2: Detail per proses (modal POTONG, CETAK, dst)
    PROSES_LIST.forEach((p) => {
      PROSES_SECTIONS.forEach((s) => {
        (jo.defectsByKategori?.[p]?.data?.[s.key] || []).forEach((it: any) => {
          (it.wastes || []).forEach((w: any) => {
            prosesRows.push([
              noJo,
              p,
              s.label,
              dash(it.inspektor),
              w.kode_waste,
              w.waste_desc,
              num(w.total_defect),
            ]);
          });
        });
      });
    });

    // Sheet 3+: Detail waste / kendala
    const defects = sortDesc(
      (jo.defects || []).filter((d: any) => isWaste || d.kode_kendala),
      'total_defect',
    );

    defects.forEach((d: any) => {
      const ref = isWaste
        ? `${d.kode_waste} - ${d.waste_desc}`
        : `${d.kode_kendala} - ${d.kendala_desc}`;
      const keyCols = isWaste
        ? [d.kode_waste, d.waste_desc]
        : [d.kategori_kendala, d.kode_kendala, d.kendala_desc];

      const subs = sortDesc(d.kendala, 'calculated_defect');
      if (subs.length > 0) {
        subs.forEach((k: any) => {
          const subCols = isWaste
            ? [k.kategori_kendala, k.kode_kendala, k.kendala_desc]
            : [k.kode_waste, k.waste_desc];
          mainRows.push([
            noJo,
            ...keyCols,
            num(d.total_defect),
            ...subCols,
            num(k.calculated_defect),
          ]);
        });
      } else {
        mainRows.push([
          noJo,
          ...keyCols,
          num(d.total_defect),
          ...(isWaste
            ? ['-', '-', 'Tidak ada Data Kendala']
            : ['-', 'Tidak ada data Waste']),
          0,
        ]);
      }

      getUniqueVerifikator(d.verifikator_inspektor).forEach((v: any) => {
        verifRows.push([
          noJo,
          ref,
          dash(v.kode_mr),
          formatTanggal(v.tanggal_tiket),
          dash(v.inspektor_mtc),
          dash(v.verifikator_qc),
          dash(v.operator),
          dash(v.kode_lkh),
          dash(v.nama_kendala),
        ]);
      });

      cleanList(d.operator_inspektor).forEach((op: any) => {
        const code = isWaste ? op.kode_lkh : op.kode_waste;
        const problem = isWaste ? op.masalah_lkh : op.masalah;
        opRows.push([
          noJo,
          ref,
          dash(op.inspektor),
          dash(op.operator),
          dash(op.mesin),
          dash(code),
          dash(problem),
          formatTemuan(op.temuan),
          num(op.calculated_defect),
        ]);

        cleanList(op.verifikator_inspektor).forEach((v: any) => {
          nestedRows.push([
            noJo,
            ref,
            dash(code),
            dash(problem),
            dash(v.kode_mr),
            formatTanggal(v.tanggal_tiket),
            dash(v.inspektor_mtc),
            dash(v.verifikator_qc),
            dash(v.kode_lkh),
            dash(v.nama_kendala),
          ]);
        });
      });
    });
  });

  appendSheet(
    wb,
    'List JO',
    [
      'No',
      'No JO',
      'No IO',
      'Customer',
      'Produk',
      ...PROSES_LIST,
      'Total Defect',
    ],
    listRows,
  );

  appendSheet(
    wb,
    'Detail Proses',
    [
      'No JO',
      'Proses',
      'Kategori',
      'Inspector',
      'Kode Waste',
      'Deskripsi Waste',
      'Total Defect',
    ],
    prosesRows,
  );

  appendSheet(
    wb,
    isWaste ? 'Waste-Kendala' : 'Kendala-Waste',
    isWaste
      ? [
          'No JO',
          'Kode Waste',
          'Deskripsi Waste',
          'Total Defect',
          'Kategori Kendala',
          'Kode Kendala',
          'Deskripsi Kendala',
          'Defect By Kendala',
        ]
      : [
          'No JO',
          'Kategori Kendala',
          'Kode Kendala',
          'Deskripsi Kendala',
          'Total Defect',
          'Kode Waste',
          'Deskripsi Waste',
          'Defect By Waste',
        ],
    mainRows,
  );

  appendSheet(
    wb,
    'Verifikator QC',
    [
      'No JO',
      isWaste ? 'Waste' : 'Kendala',
      'Kode MR',
      'Tanggal Tiket',
      'Teknisi MTC',
      'Verifikator QC',
      'Operator',
      'Kode',
      'Masalah',
    ],
    verifRows,
  );

  appendSheet(
    wb,
    isWaste ? 'Detail Kendala' : 'Detail Waste',
    [
      'No JO',
      isWaste ? 'Waste' : 'Kendala',
      'Inspektor',
      'Operator',
      'Mesin',
      isWaste ? 'Kode LKH' : 'Kode Waste',
      isWaste ? 'Masalah LKH' : 'Masalah Waste',
      'Temuan',
      'Defect',
    ],
    opRows,
  );

  appendSheet(
    wb,
    'Verifikator per Detail',
    [
      'No JO',
      isWaste ? 'Waste' : 'Kendala',
      isWaste ? 'Kode LKH' : 'Kode Waste',
      isWaste ? 'Masalah LKH' : 'Masalah Waste',
      'Kode MR',
      'Tanggal Tiket',
      'Inspektor MTC',
      'Verifikator QC',
      'Kode',
      'Masalah',
    ],
    nestedRows,
  );

  return wb;
}

export function exportWasteByJo(list: any[], from: any, to: any) {
  save(buildByJo('waste', list), 'Waste_By_JO', from, to);
}

export function exportKendalaByJo(list: any[], from: any, to: any) {
  save(buildByJo('kendala', list), 'Kendala_By_JO', from, to);
}

/* ------------------------------- Export All ------------------------------- */

export function exportWasteAll(data: any[], from: any, to: any) {
  const wb = XLSX.utils.book_new();
  const rows: Row[] = [];

  sortDesc(data || [], 'total_defect').forEach((d) => {
    const subs = sortDesc(d.kendala, 'calculated_defect');
    if (subs.length > 0) {
      subs.forEach((k: any) => {
        rows.push([
          `${d.kode_waste} - ${d.waste_desc}`,
          num(d.total_defect),
          k.kategori_kendala,
          k.kode_kendala,
          k.kendala_desc,
          num(k.calculated_defect),
        ]);
      });
    } else {
      rows.push([
        `${d.kode_waste} - ${d.waste_desc}`,
        num(d.total_defect),
        '-',
        '-',
        '-',
        '-',
      ]);
    }
  });

  appendSheet(
    wb,
    'Waste All',
    [
      'Kode Waste',
      'Total Defect',
      'Kategori Kendala',
      'Kode Kendala',
      'Deskripsi Kendala',
      'Defect By Kendala',
    ],
    rows,
  );
  save(wb, 'Waste_All', from, to);
}

export function exportKendalaAll(data: any[], from: any, to: any) {
  const wb = XLSX.utils.book_new();
  const rows: Row[] = [];

  sortDesc(data || [], 'total_defect').forEach((d) => {
    const subs = sortDesc(d.kode_waste, 'total_defect');
    if (subs.length > 0) {
      subs.forEach((w: any) => {
        rows.push([
          d.kategori_kendala,
          `${d.kode_kendala} - ${d.kendala_desc}`,
          num(d.total_defect),
          w.kode_waste,
          w.waste_desc,
          num(w.total_defect),
        ]);
      });
    } else {
      rows.push([
        d.kategori_kendala,
        `${d.kode_kendala} - ${d.kendala_desc}`,
        num(d.total_defect),
        '-',
        '-',
        '-',
      ]);
    }
  });

  appendSheet(
    wb,
    'Kendala All',
    [
      'Kategori Kendala',
      'Kode Kendala',
      'Total Defect',
      'Kode Waste',
      'Deskripsi Waste',
      'Defect By Waste',
    ],
    rows,
  );
  save(wb, 'Kendala_All', from, to);
}
