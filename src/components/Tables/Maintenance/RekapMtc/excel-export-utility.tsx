import * as XLSX from 'xlsx';

// This utility handles Excel exports for different API data types
export const createExcelExport = (data: any, fileName: string) => {
  // Create workbook with multiple sheets if needed
  const workbook = XLSX.utils.book_new();

  // Process and add main data sheet
  const mainSheet = processMainData(data);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Main Data');

  // Check for nested arrays that need separate sheets
  if (data) {
    // Process nested arrays as separate sheets
    processNestedArrays(data, workbook);
  }

  // Save workbook as Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Process main data into a worksheet
const processMainData = (data: any): XLSX.WorkSheet => {
  // If data is an array, process each item
  if (Array.isArray(data)) {
    const processedData = data.map((item) =>
      typeof item === 'object' && item !== null
        ? flattenObject(item)
        : { value: item },
    );
    return XLSX.utils.json_to_sheet(processedData);
  }

  // Handle regular object data
  const flattened = flattenObject(data);
  // Special case for empty objects or null values
  if (Object.keys(flattened).length === 0) {
    return XLSX.utils.json_to_sheet([{ 'No Data': 'No data available' }]);
  }

  return XLSX.utils.json_to_sheet([flattened]);
};

// Process nested arrays into separate sheets
const processNestedArrays = (data: any, workbook: XLSX.WorkBook) => {
  if (!data || typeof data !== 'object') return;

  // Find all key-value pairs where value is an array
  Object.entries(data).forEach(([key, value]) => {
    // If value is an array with objects inside, create a separate sheet
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'object'
    ) {
      // Process array data for the sheet
      const arrayData = value.map((item) =>
        typeof item === 'object' ? flattenObject(item) : { value: item },
      );

      // Create sheet with sanitized name (Excel has 31 char limit for sheet names)
      const sheetName = sanitizeSheetName(key);
      const sheet = XLSX.utils.json_to_sheet(arrayData);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    // If value is an object, recursively check for arrays
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      processNestedArrays(value, workbook);
    }
  });
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

// Flatten object - handles nested properties but preserves arrays as values
const flattenObject = (obj: any, prefix = ''): any => {
  if (obj === null || obj === undefined) return {};

  const flattened: any = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    // If value is an array, store array length but don't include the array itself
    // (Arrays will be processed as separate sheets)
    if (Array.isArray(value)) {
      flattened[`${newKey}_count`] = value.length;
    }
    // If nested object but not array, recursively flatten
    else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, newKey));
    }
    // For primitive values, add to flattened object
    else {
      flattened[newKey] = value;
    }
  });

  return flattened;
};

// Export utility for handling specific API responses
export const ExportUtility = {
  // Generic export function that processes any JSON data
  exportAny: (data: any, fileName: string) => {
    createExcelExport(data, fileName);
  },
};
