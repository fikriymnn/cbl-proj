import React from 'react';
import * as XLSX from 'xlsx';

import { ExportUtility } from './excel-export-utility';

interface ExportButtonProps {
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
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  type,
  label = 'Export to Excel',
  dateRange,
  mesinName,
  className = '',
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    // Try to parse the date
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      // If parsing fails, return the original string
      return dateStr;
    }
  };

  // Helper to convert month number to name
  const getMonthName = (month: string | number) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthIndex = parseInt(String(month), 10) - 1;
    return monthNames[monthIndex] || month;
  };

  // Helper to convert minutes to hours
  const minutesToHours = (minutes: number | string): number => {
    const mins = typeof minutes === 'string' ? parseFloat(minutes) : minutes;
    return mins / 60;
  };

  // Format number to 2 decimal places
  const formatToTwoDecimal = (num: number): string => {
    return num.toFixed(2);
  };

  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0]; // Today's date for the filename
    let baseFilename = '';

    // Based on type, create appropriate base filename
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

    // Add date range information if available
    let dateInfo = '';

    if (dateRange) {
      if (dateRange.year && dateRange.month) {
        // Format: basefilename_2023_April - Apply to all types that have year and month
        const monthName = getMonthName(dateRange.month);
        dateInfo = `_${dateRange.year}_${monthName}`;
      } else if (dateRange.from && dateRange.to) {
        // Format: basefilename_from_2023-01-01_to_2023-01-31
        dateInfo = `_${formatDate(dateRange.from)}_to_${formatDate(
          dateRange.to,
        )}`;
      } else if (dateRange.year) {
        // Format: basefilename_2023
        dateInfo = `_${dateRange.year}`;
      }
    }

    // Combine all parts and return the filename
    return `${baseFilename}${dateInfo}_export_${timestamp}`;
  };

  const handleExport = () => {
    if (!data) {
      console.error('No data available to export');
      return;
    }

    const filename = generateFilename();

    try {
      // For responTimeBulan and breakDownMonth reports (monthly data)
      if (type === 'responTimeBulan' || type === 'breakDownMonth') {
        // Create a deep copy of the data to avoid modifying the original
        const dataCopy = JSON.parse(JSON.stringify(data));

        interface FlattenedMachine {
          mesin: any;
          month?: string | number;
          year?: string | number;
          nama_bulan?: string;
          jumlah_waktu_menit?: number;
          rata_rata_waktu_menit?: number;
          jumlah_waktu_jam?: string;
          rata_rata_waktu_jam?: string;
          [key: string]: any; // For dynamic monthly data
        }

        // Process the data for monthly format (each machine has an array of monthly data)
        const processedData = dataCopy.map((machine: any) => {
          // Create a flattened machine object for the main sheet
          const flattenedMachine: FlattenedMachine = {
            mesin: machine.mesin,
          };

          // Process monthly data if available
          if (Array.isArray(machine.data) && machine.data.length > 0) {
            // We'll use the first month's data for the main machine entry
            const firstMonth = machine.data[0];

            // Add basic month info
            flattenedMachine.month = firstMonth.month;
            flattenedMachine.year = firstMonth.year;
            flattenedMachine.nama_bulan = firstMonth.nama_bulan;

            // Add minute values
            flattenedMachine.jumlah_waktu_menit = firstMonth.jumlah_waktu_menit;
            flattenedMachine.rata_rata_waktu_menit =
              firstMonth.rata_rata_waktu_menit;

            // Add hour values with 2 decimal places
            flattenedMachine.jumlah_waktu_jam = formatToTwoDecimal(
              parseFloat(firstMonth.jumlah_waktu_jam || '0'),
            );

            flattenedMachine.rata_rata_waktu_jam = formatToTwoDecimal(
              parseFloat(firstMonth.rata_rata_waktu_jam || '0'),
            );

            // Save the monthly data for a separate sheet
            flattenedMachine[`${machine.mesin}_monthly_data`] =
              machine.data.map((month: any) => {
                // Format hour values for each month
                return {
                  ...month,
                  jumlah_waktu_jam: formatToTwoDecimal(
                    parseFloat(month.jumlah_waktu_jam || '0'),
                  ),
                  rata_rata_waktu_jam: formatToTwoDecimal(
                    parseFloat(month.rata_rata_waktu_jam || '0'),
                  ),
                };
              });
          }

          return flattenedMachine;
        });

        // Create a custom export for monthly data
        createCustomMonthlyExport(processedData, filename);
      }
      // For responTime and breakDown reports (weekly data)
      else if (type === 'responTime' || type === 'breakDown') {
        // Create a deep copy of the data to avoid modifying the original
        const dataCopy = JSON.parse(JSON.stringify(data));

        // Process the data to handle the minggu array and convert minutes to hours
        const processedData = dataCopy.map((machine: any) => {
          // Create a new object that will contain the flattened data
          const flattenedMachine = { ...machine };

          // Add total hours fields
          if (machine.jumlah_waktu_menit) {
            flattenedMachine.jumlah_waktu_jam = formatToTwoDecimal(
              minutesToHours(machine.jumlah_waktu_menit),
            );
          }

          // Add average hours fields
          if (machine.rata_rata_waktu_menit) {
            flattenedMachine.rata_rata_waktu_jam = formatToTwoDecimal(
              minutesToHours(machine.rata_rata_waktu_menit),
            );
          }

          // Handle the minggu array to prevent duplicate sheet names
          if (Array.isArray(machine.minggu)) {
            // Process each week in minggu
            machine.minggu.forEach((week: any, weekIndex: number) => {
              const weekNum = week.Minggu_ke || weekIndex + 1;

              // Add minute values
              flattenedMachine[`Week_${weekNum}_Minutes`] =
                week.jumlah_waktu_menit;

              // Convert and add hour values with 2 decimal places
              if (week.jumlah_waktu_menit) {
                flattenedMachine[`Week_${weekNum}_Hours`] = formatToTwoDecimal(
                  minutesToHours(week.jumlah_waktu_menit),
                );
              } else if (week.jumlah_waktu_jam) {
                // If hours already exist, just format to 2 decimal places
                flattenedMachine[`Week_${weekNum}_Hours`] = formatToTwoDecimal(
                  parseFloat(week.jumlah_waktu_jam),
                );
              }

              // Add average minute values
              flattenedMachine[`Week_${weekNum}_Avg_Minutes`] =
                week.rata_rata_waktu_menit;

              // Convert and add average hour values
              if (week.rata_rata_waktu_menit) {
                flattenedMachine[`Week_${weekNum}_Avg_Hours`] =
                  formatToTwoDecimal(
                    minutesToHours(week.rata_rata_waktu_menit),
                  );
              } else if (week.rata_rata_waktu_jam) {
                // If average hours already exist, just format to 2 decimal places
                flattenedMachine[`Week_${weekNum}_Avg_Hours`] =
                  formatToTwoDecimal(parseFloat(week.rata_rata_waktu_jam));
              }
            });

            // Process the weekly data for the detailed sheet
            const processedWeeks = machine.minggu.map((week: any) => {
              const processedWeek = { ...week };

              // Convert minutes to hours for each week
              if (week.jumlah_waktu_menit) {
                processedWeek.jumlah_waktu_jam = formatToTwoDecimal(
                  minutesToHours(week.jumlah_waktu_menit),
                );
              } else if (week.jumlah_waktu_jam) {
                // If hours already exist, just format to 2 decimal places
                processedWeek.jumlah_waktu_jam = formatToTwoDecimal(
                  parseFloat(week.jumlah_waktu_jam),
                );
              }

              // Convert average minutes to hours
              if (week.rata_rata_waktu_menit) {
                processedWeek.rata_rata_waktu_jam = formatToTwoDecimal(
                  minutesToHours(week.rata_rata_waktu_menit),
                );
              } else if (week.rata_rata_waktu_jam) {
                // If average hours already exist, just format to 2 decimal places
                processedWeek.rata_rata_waktu_jam = formatToTwoDecimal(
                  parseFloat(week.rata_rata_waktu_jam),
                );
              }

              return processedWeek;
            });

            // Create a uniquely named sheet for this machine's weeks
            flattenedMachine[`${machine.mesin}_minggu_data`] = processedWeeks;

            // Remove the original minggu array to prevent duplicate sheet names
            delete flattenedMachine.minggu;
          }

          return flattenedMachine;
        });

        // Create a custom export that handles the minggu arrays
        createCustomExport(processedData, filename);
      } else {
        // Use the standard export utility for other data types
        ExportUtility.exportAny(data, filename);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Custom export function for monthly data (responTimeBulan and breakDownMonth)
  const createCustomMonthlyExport = (data: any[], filename: string) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add the main sheet with flattened data
    const mainSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Main Data');

    // Create separate sheets for each machine with monthly data
    data.forEach((machine) => {
      // Find all machine_monthly_data properties
      Object.entries(machine).forEach(([key, value]) => {
        if (key.endsWith('_monthly_data') && Array.isArray(value)) {
          // Create a sheet for this machine's monthly data
          const sheetName = sanitizeSheetName(key.replace('_monthly_data', ''));

          // Enhanced data for machine sheets - add calculated hour fields
          const enhancedMonthlyData = (value as any[]).map((month: any) => {
            const enhancedMonth = { ...month };

            // Format hour values for consistency
            enhancedMonth.jumlah_waktu_jam = formatToTwoDecimal(
              parseFloat(month.jumlah_waktu_jam || '0'),
            );

            // Add total hours column
            enhancedMonth['Total Hours'] = enhancedMonth.jumlah_waktu_jam;

            // Format average hour values
            enhancedMonth.rata_rata_waktu_jam = formatToTwoDecimal(
              parseFloat(month.rata_rata_waktu_jam || '0'),
            );

            // Add average hours column
            enhancedMonth['Average Hours'] = enhancedMonth.rata_rata_waktu_jam;

            return enhancedMonth;
          });

          const monthSheet = XLSX.utils.json_to_sheet(enhancedMonthlyData);
          XLSX.utils.book_append_sheet(workbook, monthSheet, sheetName);
        }
      });
    });

    // Write the workbook to a file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // Custom export function for weekly data (responTime and breakDown)
  const createCustomExport = (data: any[], filename: string) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add the main sheet with flattened data
    const mainSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Main Data');

    // Create separate sheets for each machine with enhanced data
    data.forEach((machine) => {
      // Find all machine_minggu_data properties
      Object.entries(machine).forEach(([key, value]) => {
        if (key.endsWith('_minggu_data') && Array.isArray(value)) {
          // Create a sheet for this machine's weekly data
          const sheetName = sanitizeSheetName(key.replace('_minggu_data', ''));

          // Enhanced data for machine sheets - add calculated hour fields
          const enhancedWeeklyData = (value as any[]).map((week: any) => {
            const enhancedWeek = { ...week };

            // Convert minutes to hours if not already done
            if (week.jumlah_waktu_menit && !week.jumlah_waktu_jam) {
              enhancedWeek.jumlah_waktu_jam = formatToTwoDecimal(
                minutesToHours(week.jumlah_waktu_menit),
              );
            } else if (week.jumlah_waktu_jam) {
              // Ensure consistent formatting
              enhancedWeek.jumlah_waktu_jam = formatToTwoDecimal(
                parseFloat(week.jumlah_waktu_jam),
              );
            }

            // Add total hours column
            enhancedWeek['Total Hours'] =
              enhancedWeek.jumlah_waktu_jam || '0.00';

            // Convert average minutes to hours if not already done
            if (week.rata_rata_waktu_menit && !week.rata_rata_waktu_jam) {
              enhancedWeek.rata_rata_waktu_jam = formatToTwoDecimal(
                minutesToHours(week.rata_rata_waktu_menit),
              );
            } else if (week.rata_rata_waktu_jam) {
              // Ensure consistent formatting
              enhancedWeek.rata_rata_waktu_jam = formatToTwoDecimal(
                parseFloat(week.rata_rata_waktu_jam),
              );
            }

            // Add average hours column
            enhancedWeek['Average Hours'] =
              enhancedWeek.rata_rata_waktu_jam || '0.00';

            return enhancedWeek;
          });

          const weekSheet = XLSX.utils.json_to_sheet(enhancedWeeklyData);
          XLSX.utils.book_append_sheet(workbook, weekSheet, sheetName);
        }
      });
    });

    // Write the workbook to a file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // Sanitize sheet name for Excel (limit 31 chars, no special chars)
  const sanitizeSheetName = (name: string): string => {
    // Replace invalid characters with underscores
    let sanitized = name.replace(/[\[\]\\\/\?*:]/g, '_');

    // Truncate to 31 characters (Excel limit)
    if (sanitized.length > 31) {
      sanitized = sanitized.substring(0, 31);
    }

    return sanitized;
  };

  return (
    <button
      onClick={handleExport}
      className={`export-button ${className}  bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg transition-colors flex-1 disabled:opacity-50`}
    >
      {label}
    </button>
  );
};
