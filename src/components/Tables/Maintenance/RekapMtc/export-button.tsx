import React from 'react';
import * as XLSX from 'xlsx';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

// ─── helpers ────────────────────────────────────────────────────────────────

const sanitizeSheetName = (name: string): string =>
  name.replace(/[\[\]\\\/\?*:]/g, '_').substring(0, 31);

/** Render a Chart.js config to a PNG base64 string (no external libs needed) */
const renderChartToBase64 = (
  config: ChartConfiguration,
  width = 900,
  height = 500,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas); // must be in DOM for some browsers

    let chart: Chart | null = null;
    try {
      chart = new Chart(canvas, {
        ...config,
        options: {
          ...config.options,
          responsive: false,
          animation: false, // disable animation so it renders immediately
        },
      });
    } catch (e) {
      document.body.removeChild(canvas);
      reject(e);
      return;
    }

    // requestAnimationFrame ensures the chart has actually painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const base64 = canvas.toDataURL('image/png').split(',')[1];
          chart?.destroy();
          document.body.removeChild(canvas);
          resolve(base64);
        } catch (e) {
          chart?.destroy();
          document.body.removeChild(canvas);
          reject(e);
        }
      });
    });
  });

// ─── data unwrapping ─────────────────────────────────────────────────────────

/**
 * Each export type may wrap its real array in a named key.
 * This returns { rows, key } where `rows` is the flat array to chart/tabulate.
 */
const unwrapData = (
  raw: any,
  type: string,
): { rows: any[]; totalRow?: Record<string, any> } => {
  if (!raw) return { rows: [] };

  switch (type) {
    case 'quality':
      return {
        rows: raw.quality_defect ?? [],
        totalRow:
          raw.total_count != null
            ? {
                kode_analisis_mtc: 'TOTAL',
                nama_analisis_mtc: '',
                count: raw.total_count,
              }
            : undefined,
      };
    case 'produksi':
      return {
        rows: raw.produksi_defect ?? [],
        totalRow:
          raw.total_count != null
            ? {
                kode_analisis_mtc: 'TOTAL',
                nama_analisis_mtc: '',
                count: raw.total_count,
              }
            : undefined,
      };
    case 'mesinProblem':
      return {
        rows: raw.jenis_masalah ?? (Array.isArray(raw) ? raw : []),
        totalRow:
          raw.total_count != null
            ? {
                mesin: 'TOTAL',
                count: raw.total_count,
                jenis_produksi: raw.total_produksi,
                jenis_quality: raw.total_quality,
              }
            : undefined,
      };
    case 'oneMesin': {
      // raw is data_jenis_masalah
      const dm = raw.data_jenis_masalah ?? raw;
      const prodRows = (dm.kode_produksi ?? []).map((r: any) => ({
        ...r,
        kategori: 'Produksi',
      }));
      const qualRows = (dm.kode_quality ?? []).map((r: any) => ({
        ...r,
        kategori: 'Quality',
      }));
      return { rows: [...prodRows, ...qualRows] };
    }
    case 'responTime':
    case 'breakDown':
      return { rows: Array.isArray(raw) ? raw : [] };
    case 'responTimeBulan':
    case 'breakDownMonth':
      return { rows: Array.isArray(raw) ? raw : raw.data ?? [] };
    default:
      return { rows: Array.isArray(raw) ? raw : [] };
  }
};

// ─── chart config builder ────────────────────────────────────────────────────

const buildChartConfig = (
  rows: any[],
  type: string,
  chartType: 'bar' | 'line' | 'pie' | 'doughnut',
  title: string,
): ChartConfiguration | null => {
  if (!rows.length) return null;

  let labels: string[] = [];
  let values: number[] = [];

  switch (type) {
    case 'quality':
      labels = rows.map((r) => r.nama_analisis_mtc || r.kode_analisis_mtc);
      values = rows.map((r) => Number(r.count) || 0);
      break;
    case 'produksi':
      labels = rows.map((r) => r.nama_analisis_mtc || r.kode_analisis_mtc);
      values = rows.map((r) => Number(r.count) || 0);
      break;
    case 'mesinProblem':
      labels = rows.map((r) => r.mesin);
      values = rows.map((r) => Number(r.count) || 0);
      break;
    case 'oneMesin':
      labels = rows.map(
        (r) => `[${r.kategori}] ${r.nama_analisis_mtc || r.kode_analisis_mtc}`,
      );
      values = rows.map((r) => Number(r.count) || 0);
      break;
    case 'responTime':
    case 'breakDown':
      labels = rows.map((r) => r.mesin || 'Unknown');
      values = rows.map((r) =>
        parseFloat(parseFloat(r.jumlah_waktu_jam ?? '0').toFixed(2)),
      );
      break;
    case 'responTimeBulan':
    case 'breakDownMonth':
      labels = rows.map((r) => r.mesin || 'Unknown');
      values = rows.map((r) => {
        if (r.data && Array.isArray(r.data)) {
          return parseFloat(
            r.data
              .reduce(
                (s: number, m: any) =>
                  s + parseFloat(m.jumlah_waktu_jam ?? '0'),
                0,
              )
              .toFixed(2),
          );
        }
        return parseFloat(parseFloat(r.jumlah_waktu_jam ?? '0').toFixed(2));
      });
      break;
    default:
      return null;
  }

  const colors = labels.map(
    (_, i) => `hsla(${(i * 360) / Math.max(labels.length, 1)}, 65%, 55%, 0.85)`,
  );
  const borderColors = labels.map(
    (_, i) => `hsla(${(i * 360) / Math.max(labels.length, 1)}, 65%, 40%, 1)`,
  );

  const isPieLike = chartType === 'pie' || chartType === 'doughnut';

  return {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: isPieLike ? colors : colors[0],
          borderColor: isPieLike ? borderColors : borderColors[0],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' },
          padding: 20,
        },
        legend: { display: true, position: 'top' },
      },
      scales: isPieLike
        ? undefined
        : {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.08)' } },
            x: { grid: { color: 'rgba(0,0,0,0.08)' } },
          },
    },
  } as ChartConfiguration;
};

// ─── sheet builders ──────────────────────────────────────────────────────────

const buildMainSheet = (
  rows: any[],
  totalRow?: Record<string, any>,
): XLSX.WorkSheet => {
  if (!rows.length)
    return XLSX.utils.json_to_sheet([{ Note: 'No data available' }]);
  const all = totalRow ? [...rows, totalRow] : rows;
  return XLSX.utils.json_to_sheet(all);
};

/** For weekly (responTime / breakDown): one row per machine with week columns */
const buildWeeklySheet = (rows: any[]): XLSX.WorkSheet => {
  if (!rows.length) return XLSX.utils.json_to_sheet([{ Note: 'No data' }]);
  const flat = rows.map((machine) => {
    const row: Record<string, any> = { Mesin: machine.mesin };
    (machine.minggu ?? []).forEach((w: any, i: number) => {
      row[`Minggu ${i + 1}`] = parseFloat(
        parseFloat(w.jumlah_waktu_jam ?? '0').toFixed(2),
      );
    });
    row['Total (Jam)'] = parseFloat(
      parseFloat(machine.jumlah_waktu_jam ?? '0').toFixed(2),
    );
    row['Rata-Rata (Jam)'] = parseFloat(
      parseFloat(machine.rata_rata_waktu_jam ?? '0').toFixed(2),
    );
    return row;
  });
  return XLSX.utils.json_to_sheet(flat);
};

/** For monthly (responTimeBulan / breakDownMonth): one row per machine, columns = months */
const buildMonthlySheet = (rows: any[], listBulan?: any[]): XLSX.WorkSheet => {
  if (!rows.length) return XLSX.utils.json_to_sheet([{ Note: 'No data' }]);
  const flat = rows.map((machine) => {
    const row: Record<string, any> = { Mesin: machine.mesin };
    (machine.data ?? []).forEach((m: any) => {
      row[m.nama_bulan ?? 'Bulan'] = parseFloat(
        parseFloat(m.jumlah_waktu_jam ?? '0').toFixed(2),
      );
    });
    return row;
  });
  return XLSX.utils.json_to_sheet(flat);
};

// ─── main export function ─────────────────────────────────────────────────────

export const exportToExcel = async (
  rawData: any,
  type: string,
  fileName: string,
  chartTypes: ('bar' | 'line' | 'pie' | 'doughnut')[] = ['bar'],
  dateRange?: any,
): Promise<void> => {
  const wb = XLSX.utils.book_new();

  const { rows, totalRow } = unwrapData(rawData, type);

  // ── Sheet 1: Data ──────────────────────────────────────────────────────────
  let dataSheet: XLSX.WorkSheet;
  if (type === 'responTime' || type === 'breakDown') {
    dataSheet = buildWeeklySheet(rows);
  } else if (type === 'responTimeBulan' || type === 'breakDownMonth') {
    dataSheet = buildMonthlySheet(rows, rawData?.listBulan);
  } else {
    dataSheet = buildMainSheet(rows, totalRow);
  }
  XLSX.utils.book_append_sheet(wb, dataSheet, 'Data');

  // ── Sheet 2: Charts (PNG base64 embedded via a hidden img trick) ───────────
  // SheetJS (xlsx) doesn't support image embedding natively.
  // We use a reliable approach: write chart images as base64 into a dedicated
  // "Charts" sheet as data-URI strings, AND separately create an HTML file
  // with the actual charts rendered so the user can screenshot / print.
  // Additionally we try ExcelJS if available for true embedding.

  // Build chart images
  const chartImagesBase64: {
    title: string;
    base64: string;
    chartType: string;
  }[] = [];

  for (const chartType of chartTypes) {
    const title = `${type} – ${chartType.toUpperCase()} Chart`;
    const config = buildChartConfig(rows, type, chartType, title);
    if (!config) continue;
    try {
      const base64 = await renderChartToBase64(config, 900, 500);
      chartImagesBase64.push({ title, base64, chartType });
    } catch (e) {
      console.warn(`Chart render failed for ${chartType}:`, e);
    }
  }

  // ── Try ExcelJS for true image embedding ──────────────────────────────────
  let excelJSSuccess = false;
  try {
    const ExcelJS = await import('exceljs');
    const excelWb = new ExcelJS.Workbook();
    excelWb.creator = 'Export Utility';

    // Data sheet
    const excelDataSheet = excelWb.addWorksheet('Data');
    if (rows.length > 0) {
      const allRows = totalRow ? [...rows, totalRow] : rows;
      // For weekly / monthly, use the flat representation
      let exportRows: any[];
      if (type === 'responTime' || type === 'breakDown') {
        exportRows = (rows as any[]).map((machine) => {
          const row: Record<string, any> = { Mesin: machine.mesin };
          (machine.minggu ?? []).forEach((w: any, i: number) => {
            row[`Minggu ${i + 1}`] = parseFloat(
              parseFloat(w.jumlah_waktu_jam ?? '0').toFixed(2),
            );
          });
          row['Total (Jam)'] = parseFloat(
            parseFloat(machine.jumlah_waktu_jam ?? '0').toFixed(2),
          );
          row['Rata-Rata (Jam)'] = parseFloat(
            parseFloat(machine.rata_rata_waktu_jam ?? '0').toFixed(2),
          );
          return row;
        });
      } else if (type === 'responTimeBulan' || type === 'breakDownMonth') {
        exportRows = (rows as any[]).map((machine) => {
          const row: Record<string, any> = { Mesin: machine.mesin };
          (machine.data ?? []).forEach((m: any) => {
            row[m.nama_bulan ?? 'Bulan'] = parseFloat(
              parseFloat(m.jumlah_waktu_jam ?? '0').toFixed(2),
            );
          });
          return row;
        });
      } else {
        exportRows = allRows;
      }

      if (exportRows.length > 0) {
        const headers = Object.keys(exportRows[0]);
        const headerRow = excelDataSheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD0E4FF' },
        };
        exportRows.forEach((r) =>
          excelDataSheet.addRow(headers.map((h) => r[h])),
        );
        excelDataSheet.columns.forEach((col) => {
          col.width = 18;
        });
      }
    }

    // Charts sheet with embedded images
    if (chartImagesBase64.length > 0) {
      const chartsSheet = excelWb.addWorksheet('Charts');

      // Title
      chartsSheet.mergeCells('A1:J1');
      const titleCell = chartsSheet.getCell('A1');
      titleCell.value = `${type} – Chart Analysis`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };

      let currentRow = 3;
      for (const { title, base64, chartType } of chartImagesBase64) {
        // Section title
        chartsSheet.getCell(`A${currentRow}`).value = title;
        chartsSheet.getCell(`A${currentRow}`).font = {
          size: 13,
          bold: true,
          color: { argb: 'FF0065DE' },
        };
        currentRow += 1;

        // Convert base64 to buffer
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++)
          bytes[i] = binaryStr.charCodeAt(i);

        const imageId = excelWb.addImage({
          buffer: bytes.buffer,
          extension: 'png',
        });
        chartsSheet.addImage(imageId, {
          tl: { col: 0, row: currentRow - 1 },
          ext: { width: 820, height: 460 },
        });

        // Reserve rows for the image (~34 rows @ ~13.5px each ≈ 459px)
        for (let r = currentRow; r <= currentRow + 33; r++)
          chartsSheet.getRow(r).height = 13.5;
        currentRow += 36; // image rows + gap
      }
      chartsSheet.columns.forEach((col) => {
        col.width = 14;
      });
    }

    const buffer = await excelWb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    excelJSSuccess = true;
    console.log('✅ Excel with embedded charts exported via ExcelJS');
  } catch (err) {
    console.warn(
      'ExcelJS embedding failed, falling back to XLSX + separate HTML:',
      err,
    );
  }

  // ── Fallback: plain XLSX + standalone HTML with charts ─────────────────────
  if (!excelJSSuccess) {
    // Add a Charts-Info sheet with base64 note
    const infoSheet = XLSX.utils.json_to_sheet([
      { Info: 'Chart images were generated but could not be embedded.' },
      { Info: 'Open the accompanying HTML file to view the charts.' },
    ]);
    XLSX.utils.book_append_sheet(wb, infoSheet, 'Charts Info');

    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileName}_${ts}.xlsx`);

    // Export standalone HTML with charts embedded as <img> tags
    if (chartImagesBase64.length > 0) {
      const imgTags = chartImagesBase64
        .map(
          ({ title, base64 }) =>
            `<div style="margin-bottom:40px">
              <h3 style="font-family:Arial;color:#0065DE">${title}</h3>
              <img src="data:image/png;base64,${base64}" style="max-width:100%;border:1px solid #ccc;border-radius:8px"/>
            </div>`,
        )
        .join('');

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>${fileName} Charts</title>
        <style>body{font-family:Arial,sans-serif;padding:32px;background:#f8fafc}h1{color:#0065DE}</style>
        </head><body><h1>${fileName} – Charts</h1>${imgTags}</body></html>`;

      const htmlBlob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_charts_${new Date()
        .toISOString()
        .slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};

// ─── Export Button Component ──────────────────────────────────────────────────

interface EnhancedExportButtonProps {
  data: any;
  type:
    | 'mesinProblem'
    | 'quality'
    | 'produksi'
    | 'responTime'
    | 'responTimeBulan'
    | 'oneMesin'
    | 'allMesin'
    | 'breakDown'
    | 'breakDownMonth'
    | 'any';
  label?: string;
  dateRange?: {
    from?: string;
    to?: string;
    year?: string | number;
    month?: string | number;
  };
  mesinName?: string;
  className?: string;
  includeCharts?: boolean;
  chartTypes?: ('bar' | 'line' | 'pie' | 'doughnut')[];
}

const TYPE_FILENAME_MAP: Record<string, string> = {
  mesinProblem: 'mesin_problem',
  quality: 'quality_defect',
  produksi: 'produksi_defect',
  responTime: 'respon_time_minggu',
  responTimeBulan: 'respon_time_bulan',
  oneMesin: 'one_mesin',
  allMesin: 'all_mesin',
  breakDown: 'breakdown_minggu',
  breakDownMonth: 'breakdown_month',
};

export const EnhancedExportButton: React.FC<EnhancedExportButtonProps> = ({
  data,
  type,
  label = 'Export',
  dateRange,
  mesinName,
  className = '',
  includeCharts = true,
  chartTypes = ['bar'],
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!data) {
      alert('No data available to export.');
      return;
    }
    setIsExporting(true);
    try {
      const filename = mesinName
        ? `mesin_${mesinName.replace(/\s+/g, '_').toLowerCase()}`
        : TYPE_FILENAME_MAP[type] ?? 'data_export';

      await exportToExcel(
        data,
        type,
        filename,
        includeCharts ? chartTypes : [],
        dateRange,
      );
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`export-button ${className} bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Exporting…
        </>
      ) : (
        <>🖼️ {label}</>
      )}
    </button>
  );
};

// ─── Chart Preview ────────────────────────────────────────────────────────────

export const ChartPreview: React.FC<{
  data: any[];
  type: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
}> = ({ data, type, chartType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<Chart | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current || !data?.length) return;
    chartRef.current?.destroy();
    const config = buildChartConfig(
      data,
      type,
      chartType,
      `${type} – ${chartType}`,
    );
    if (config) chartRef.current = new Chart(canvasRef.current, config);
    return () => {
      chartRef.current?.destroy();
    };
  }, [data, type, chartType]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 border rounded-lg bg-white shadow-sm">
      <canvas ref={canvasRef} />
    </div>
  );
};
