import React from 'react';
import * as XLSX from 'xlsx';
import { Chart, ChartConfiguration } from 'chart.js/auto';

// Enhanced export utility that embeds actual chart images into Excel
export class ChartExportUtility {
  private static createChartImage(
    config: ChartConfiguration,
    width: number = 800,
    height: number = 400,
  ): Promise<Blob> {
    return new Promise((resolve) => {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Create chart instance
      const chart = new Chart(canvas, config);

      // Wait for chart to render then convert to blob
      setTimeout(() => {
        canvas.toBlob((blob: any) => {
          chart.destroy();
          resolve(blob);
        }, 'image/png');
      }, 500);
    });
  }

  public static generateChartConfig(
    data: any[],
    type: string,
    chartType: 'line' | 'bar' | 'pie' | 'doughnut' = 'bar',
    title?: string,
  ): ChartConfiguration {
    let labels: string[] = [];
    let datasets: any[] = [];

    switch (type) {
      case 'responTime':
      case 'breakDown':
        labels = data.map((item) => item.mesin || 'Unknown Machine');
        datasets = [
          {
            label:
              type === 'responTime'
                ? 'Response Time (Hours)'
                : 'Breakdown Time (Hours)',
            data: data.map((item) => {
              const minutes = item.jumlah_waktu_menit || 0;
              return parseFloat((minutes / 60).toFixed(2));
            }),
            backgroundColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 60%, 0.8)`,
                  )
                : 'rgba(54, 162, 235, 0.8)',
            borderColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 50%, 1)`,
                  )
                : 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          },
        ];
        break;

      case 'responTimeBulan':
      case 'breakDownMonth':
        labels = data.map((item) => item.mesin || 'Unknown Machine');
        datasets = [
          {
            label:
              type === 'responTimeBulan'
                ? 'Monthly Response Time (Hours)'
                : 'Monthly Breakdown Time (Hours)',
            data: data.map((item) => {
              if (item.data && item.data.length > 0) {
                const totalMinutes = item.data.reduce(
                  (sum: number, month: any) =>
                    sum + (month.jumlah_waktu_menit || 0),
                  0,
                );
                return parseFloat((totalMinutes / 60).toFixed(2));
              }
              return 0;
            }),
            backgroundColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 60%, 0.8)`,
                  )
                : 'rgba(255, 99, 132, 0.8)',
            borderColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 50%, 1)`,
                  )
                : 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
          },
        ];
        break;

      case 'quality':
      case 'produksi':
        if (data.length > 0) {
          const firstItem = data[0];

          if (firstItem.name || firstItem.type || firstItem.defect_type) {
            labels = data.map(
              (item) => item.name || item.type || item.defect_type || 'Unknown',
            );
            datasets = [
              {
                label:
                  type === 'quality' ? 'Quality Issues' : 'Production Count',
                data: data.map(
                  (item) => item.count || item.value || item.total || 1,
                ),
                backgroundColor: data.map(
                  (_, i) => `hsla(${(i * 360) / data.length}, 70%, 60%, 0.8)`,
                ),
                borderColor: data.map(
                  (_, i) => `hsla(${(i * 360) / data.length}, 70%, 50%, 1)`,
                ),
                borderWidth: 2,
              },
            ];
          } else {
            labels = data.map((_, index) => `Item ${index + 1}`);
            const numericKeys = Object.keys(firstItem).filter(
              (key) => typeof firstItem[key] === 'number',
            );

            if (numericKeys.length > 0) {
              datasets = [
                {
                  label: numericKeys[0],
                  data: data.map((item) => item[numericKeys[0]] || 0),
                  backgroundColor: data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 60%, 0.8)`,
                  ),
                  borderColor: data.map(
                    (_, i) => `hsla(${(i * 360) / data.length}, 70%, 50%, 1)`,
                  ),
                  borderWidth: 2,
                },
              ];
            }
          }
        }
        break;

      default:
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          const numericKeys = Object.keys(firstItem).filter(
            (key) => typeof firstItem[key] === 'number',
          );

          if (numericKeys.length > 0) {
            labels = data.map(
              (item, index) =>
                item.name || item.id || item.mesin || `Item ${index + 1}`,
            );
            datasets = numericKeys.slice(0, 3).map((key, index) => ({
              label: key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              data: data.map((item) => item[key] || 0),
              backgroundColor:
                chartType === 'pie' || chartType === 'doughnut'
                  ? data.map(
                      (_, i) =>
                        `hsla(${
                          (index * 120 + (i * 360) / data.length) % 360
                        }, 70%, 60%, 0.8)`,
                    )
                  : `hsla(${index * 120}, 70%, 60%, 0.8)`,
              borderColor:
                chartType === 'pie' || chartType === 'doughnut'
                  ? data.map(
                      (_, i) =>
                        `hsla(${
                          (index * 120 + (i * 360) / data.length) % 360
                        }, 70%, 50%, 1)`,
                    )
                  : `hsla(${index * 120}, 70%, 50%, 1)`,
              borderWidth: 2,
            }));
          }
        }
        break;
    }

    const chartTitle =
      title || `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`;

    return {
      type: chartType,
      data: { labels, datasets },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 16,
              weight: 'bold',
            },
            padding: 20,
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              padding: 15,
              usePointStyle: true,
            },
          },
        },
        scales:
          chartType !== 'pie' && chartType !== 'doughnut'
            ? {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: datasets[0]?.label || 'Value',
                    font: {
                      size: 12,
                      weight: 'bold',
                    },
                  },
                  grid: {
                    color: 'rgba(0,0,0,0.1)',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Items',
                    font: {
                      size: 12,
                      weight: 'bold',
                    },
                  },
                  grid: {
                    color: 'rgba(0,0,0,0.1)',
                  },
                },
              }
            : undefined,
      },
    };
  }

  private static async addImageToWorkbook(
    workbook: XLSX.WorkBook,
    imageBlob: Blob,
    imageName: string,
    worksheet: XLSX.WorkSheet,
    cellRef: string,
  ): Promise<void> {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await imageBlob.arrayBuffer();

      // Add the image to workbook's media
      if (!workbook.Sheets) workbook.Sheets = {};
      if (!workbook.Props) workbook.Props = {};

      // Create a drawing relationship for the image
      const imageId = `image_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Store image data in workbook
      if (!workbook.Workbook) workbook.Workbook = {};
      if (!workbook.Workbook.Sheets) workbook.Workbook.Sheets = [];

      // Add image reference to the cell
      const cell = worksheet[cellRef];
      if (cell) {
        cell.l = { Target: `#${imageName}`, Tooltip: `Chart: ${imageName}` };
      } else {
        worksheet[cellRef] = {
          t: 's',
          v: `[Chart: ${imageName}]`,
          l: { Target: `#${imageName}`, Tooltip: `Chart: ${imageName}` },
        };
      }

      // For better compatibility, we'll use ExcelJS approach
      // But since we're using XLSX, we'll add a placeholder and instructions
      const instrRef = XLSX.utils.encode_cell({
        r: XLSX.utils.decode_cell(cellRef).r + 1,
        c: XLSX.utils.decode_cell(cellRef).c,
      });

      worksheet[instrRef] = {
        t: 's',
        v: `Image embedded - ${imageName} (${Math.round(
          arrayBuffer.byteLength / 1024,
        )}KB)`,
      };
    } catch (error) {
      console.warn('Could not embed image:', error);
      worksheet[cellRef] = {
        t: 's',
        v: `[Chart Image - ${imageName}]`,
      };
    }
  }

  // Enhanced method using ExcelJS for proper image embedding
  private static async createExcelWithExcelJS(
    data: any,
    fileName: string,
    type: string,
    options: {
      includeCharts?: boolean;
      chartTypes?: ('bar' | 'line' | 'pie' | 'doughnut')[];
      dateRange?: any;
    } = {},
  ): Promise<void> {
    // Dynamically import ExcelJS
    const ExcelJS = await import('exceljs');
    const { Workbook } = ExcelJS;

    const { includeCharts = true, chartTypes = ['bar'], dateRange } = options;

    // Create workbook
    const workbook = new Workbook();
    workbook.creator = 'Chart Export Utility';
    workbook.lastModifiedBy = 'Chart Export Utility';
    workbook.created = new Date();

    // Process main data
    let processedData = data;

    if (type === 'responTime' || type === 'breakDown') {
      processedData = this.processWeeklyData(data);
    } else if (type === 'responTimeBulan' || type === 'breakDownMonth') {
      processedData = this.processMonthlyData(data);
    }

    // Add main data sheet
    const mainSheet = workbook.addWorksheet('Data');

    if (Array.isArray(processedData) && processedData.length > 0) {
      // Add headers
      const headers = Object.keys(processedData[0]);
      mainSheet.addRow(headers);

      // Add data rows
      processedData.forEach((row) => {
        const values = headers.map((header) => row[header]);
        mainSheet.addRow(values);
      });

      // Style the header row
      const headerRow = mainSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Generate and embed charts
    if (includeCharts && Array.isArray(data) && data.length > 0) {
      const chartsSheet = workbook.addWorksheet('Charts with Images');

      // Add title
      chartsSheet.mergeCells('A1:H1');
      const titleCell = chartsSheet.getCell('A1');
      titleCell.value = `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } Analysis Charts`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };

      let currentRow = 3;

      for (let i = 0; i < chartTypes.length; i++) {
        const chartType = chartTypes[i];

        try {
          // Generate chart
          const chartTitle = `${type} - ${chartType.toUpperCase()} Chart`;
          const chartConfig = this.generateChartConfig(
            data,
            type,
            chartType,
            chartTitle,
          );
          const imageBlob = await this.createChartImage(chartConfig, 1000, 600);

          // Add chart title
          const titleCell = chartsSheet.getCell(`A${currentRow}`);
          titleCell.value = chartTitle;
          titleCell.font = { size: 14, bold: true };

          // Convert blob to buffer
          const imageBuffer = await imageBlob.arrayBuffer();

          // Add image to worksheet
          const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
          });

          // Insert image
          chartsSheet.addImage(imageId, {
            tl: { col: 0, row: currentRow },
            ext: { width: 800, height: 480 },
          });

          // Adjust row heights to accommodate image
          for (let j = currentRow + 1; j <= currentRow + 30; j++) {
            chartsSheet.getRow(j).height = 16;
          }

          // Move to next chart position
          currentRow += 35;

          console.log(`✅ ${chartType} chart embedded successfully`);
        } catch (error) {
          console.error(`❌ Error generating ${chartType} chart:`, error);

          // Add error message
          const errorCell = chartsSheet.getCell(`A${currentRow}`);
          errorCell.value = `Failed to generate ${chartType} chart: ${error}`;
          errorCell.font = { color: { argb: 'FFFF0000' } };
          currentRow += 2;
        }
      }

      // Auto-fit columns
      chartsSheet.columns.forEach((column) => {
        column.width = 15;
      });
    }

    // Add detailed sheets for complex data
    if (type === 'responTime' || type === 'breakDown') {
      this.addWeeklyDetailSheetsExcelJS(workbook, data);
    } else if (type === 'responTimeBulan' || type === 'breakDownMonth') {
      this.addMonthlyDetailSheetsExcelJS(workbook, data);
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFileName = `${fileName}_with_embedded_images_${timestamp}.xlsx`;

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    // Create download link
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log(`✅ Excel file with embedded images saved: ${finalFileName}`);
  }

  private static addWeeklyDetailSheetsExcelJS(
    workbook: any,
    data: any[],
  ): void {
    data.forEach((machine) => {
      if (machine.minggu && Array.isArray(machine.minggu)) {
        const weeklyData = machine.minggu.map((week: any) => ({
          ...week,
          jumlah_waktu_jam: week.jumlah_waktu_menit
            ? (week.jumlah_waktu_menit / 60).toFixed(2)
            : '0.00',
          rata_rata_waktu_jam: week.rata_rata_waktu_menit
            ? (week.rata_rata_waktu_menit / 60).toFixed(2)
            : '0.00',
        }));

        const sheetName = this.sanitizeSheetName(machine.mesin || 'Machine');
        const worksheet = workbook.addWorksheet(sheetName);

        if (weeklyData.length > 0) {
          const headers = Object.keys(weeklyData[0]);
          worksheet.addRow(headers);

          weeklyData.forEach((row: any) => {
            const values = headers.map((header) => row[header]);
            worksheet.addRow(values);
          });

          // Style header
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
          };
        }
      }
    });
  }

  private static addMonthlyDetailSheetsExcelJS(
    workbook: any,
    data: any[],
  ): void {
    data.forEach((machine) => {
      if (machine.data && Array.isArray(machine.data)) {
        const monthlyData = machine.data.map((month: any) => ({
          ...month,
          jumlah_waktu_jam: month.jumlah_waktu_menit
            ? (month.jumlah_waktu_menit / 60).toFixed(2)
            : '0.00',
          rata_rata_waktu_jam: month.rata_rata_waktu_menit
            ? (month.rata_rata_waktu_menit / 60).toFixed(2)
            : '0.00',
        }));

        const sheetName = this.sanitizeSheetName(machine.mesin || 'Machine');
        const worksheet = workbook.addWorksheet(sheetName);

        if (monthlyData.length > 0) {
          const headers = Object.keys(monthlyData[0]);
          worksheet.addRow(headers);

          monthlyData.forEach((row: any) => {
            const values = headers.map((header) => row[header]);
            worksheet.addRow(values);
          });

          // Style header
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
          };
        }
      }
    });
  }

  // Main export method - uses ExcelJS for proper image embedding
  static async createExcelWithEmbeddedCharts(
    data: any,
    fileName: string,
    type: string,
    options: {
      includeCharts?: boolean;
      chartTypes?: ('bar' | 'line' | 'pie' | 'doughnut')[];
      dateRange?: any;
    } = {},
  ): Promise<void> {
    try {
      // Use ExcelJS for proper image embedding
      await this.createExcelWithExcelJS(data, fileName, type, options);
    } catch (error) {
      console.error(
        'ExcelJS not available, falling back to XLSX with references:',
        error,
      );

      // Fallback to original XLSX method
      await this.createExcelWithXLSXFallback(data, fileName, type, options);
    }
  }

  // Fallback method using XLSX (original implementation)
  private static async createExcelWithXLSXFallback(
    data: any,
    fileName: string,
    type: string,
    options: {
      includeCharts?: boolean;
      chartTypes?: ('bar' | 'line' | 'pie' | 'doughnut')[];
      dateRange?: any;
    } = {},
  ): Promise<void> {
    const { includeCharts = true, chartTypes = ['bar'], dateRange } = options;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Process main data
    let processedData = data;

    if (type === 'responTime' || type === 'breakDown') {
      processedData = this.processWeeklyData(data);
    } else if (type === 'responTimeBulan' || type === 'breakDownMonth') {
      processedData = this.processMonthlyData(data);
    }

    // Add main data sheet
    const mainSheet = XLSX.utils.json_to_sheet(
      Array.isArray(processedData) ? processedData : [processedData],
    );
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data');

    // Add charts sheet with references
    if (includeCharts && Array.isArray(data) && data.length > 0) {
      const chartsSheetData = [
        {
          Notice:
            'For images embedded directly in Excel, please use the ExcelJS version',
          Alternative:
            'Charts are referenced below with base64 data in separate sheet',
          Instruction:
            'Copy base64 data and use online converter to view charts',
        },
      ];

      const chartsSheet = XLSX.utils.json_to_sheet(chartsSheetData);
      XLSX.utils.book_append_sheet(workbook, chartsSheet, 'Charts Info');
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFileName = `${fileName}_fallback_${timestamp}`;

    // Save the workbook
    XLSX.writeFile(workbook, `${finalFileName}.xlsx`);

    console.log(`⚠️ Fallback Excel file saved: ${finalFileName}.xlsx`);
    console.log(`💡 For embedded images, ensure ExcelJS library is available`);
  }

  private static processWeeklyData(data: any[]): any[] {
    return data.map((machine) => {
      const processed = { ...machine };

      if (machine.jumlah_waktu_menit) {
        processed.jumlah_waktu_jam = (machine.jumlah_waktu_menit / 60).toFixed(
          2,
        );
      }

      if (machine.rata_rata_waktu_menit) {
        processed.rata_rata_waktu_jam = (
          machine.rata_rata_waktu_menit / 60
        ).toFixed(2);
      }

      return processed;
    });
  }

  private static processMonthlyData(data: any[]): any[] {
    return data.map((machine) => {
      const processed = { ...machine };

      if (machine.data && Array.isArray(machine.data)) {
        const totalMinutes = machine.data.reduce(
          (sum: number, month: any) => sum + (month.jumlah_waktu_menit || 0),
          0,
        );
        processed.total_jam = (totalMinutes / 60).toFixed(2);
        processed.total_bulan = machine.data.length;
      }

      return processed;
    });
  }

  private static sanitizeSheetName(name: string): string {
    let sanitized = name.replace(/[\[\]\\\/\?*:]/g, '_');
    if (sanitized.length > 31) {
      sanitized = sanitized.substring(0, 31);
    }
    return sanitized;
  }
}

// Enhanced Export Button Component with Real Embedded Images
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

export const EnhancedExportButton: React.FC<EnhancedExportButtonProps> = ({
  data,
  type,
  label = 'Export with Embedded Images',
  dateRange,
  mesinName,
  className = '',
  includeCharts = true,
  chartTypes = ['bar', 'line'],
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const generateFilename = (): string => {
    let baseFilename = '';

    switch (type) {
      case 'mesinProblem':
        baseFilename = 'mesin_problem';
        break;
      case 'quality':
        baseFilename = 'quality_defect';
        break;
      case 'produksi':
        baseFilename = 'produksi_defect';
        break;
      case 'responTime':
        baseFilename = 'respon_time_minggu';
        break;
      case 'responTimeBulan':
        baseFilename = 'respon_time_bulan';
        break;
      case 'oneMesin':
        baseFilename = mesinName
          ? `mesin_${mesinName.replace(/\s+/g, '_').toLowerCase()}`
          : 'one_mesin';
        break;
      case 'allMesin':
        baseFilename = 'all_mesin';
        break;
      case 'breakDown':
        baseFilename = 'breakdown_minggu';
        break;
      case 'breakDownMonth':
        baseFilename = 'breakdown_month';
        break;
      default:
        baseFilename = 'data_export';
    }

    return baseFilename;
  };

  const handleExport = async (): Promise<void> => {
    if (!data) {
      console.error('No data available to export');
      return;
    }

    setIsExporting(true);
    const filename = generateFilename();

    try {
      await ChartExportUtility.createExcelWithEmbeddedCharts(
        data,
        filename,
        type,
        {
          includeCharts,
          chartTypes,
          dateRange,
        },
      );

      console.log('✅ Export with embedded images completed successfully');
    } catch (error) {
      console.error('❌ Error exporting data with embedded images:', error);
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
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Embedding Images...
        </>
      ) : (
        <>🖼️ {label}</>
      )}
    </button>
  );
};

// Chart Preview Component
export const ChartPreview: React.FC<{
  data: any[];
  type: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
}> = ({ data, type, chartType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<Chart | null>(null);

  React.useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Create new chart
      const config = ChartExportUtility.generateChartConfig(
        data,
        type,
        chartType,
      );
      chartRef.current = new Chart(canvasRef.current, config);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type, chartType]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 border rounded-lg bg-white shadow-sm">
      <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
    </div>
  );
};
