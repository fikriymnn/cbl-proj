import React, { useState } from 'react';

// TypeScript interfaces for data structure
interface ProcessRecord {
  [key: string]: any;
  id?: number;
  tanggal?: string;
  createdAt?: string;
  updatedAt?: string;
  operator?: string;
  inspektor?: string;
  status?: string;
  status_jo?: string;
  mesin?: string;
  no_jo?: string;
  no_io?: string;
  customer?: string;
  alasan_pending?: string | null;
  jumlah_druk?: number;
  jumlah_pcs?: number;
  jumlah_pending?: number;
}

interface ProcessData {
  [key: string]: ProcessRecord[] | string;
}

interface SelectedProcess {
  item: ProcessData;
  process: string;
  data: ProcessRecord[];
}

interface ProcessTableProps {
  data: ProcessData[];
  loading?: boolean;
  filterTerm?: string;
}

const ProcessTable: React.FC<ProcessTableProps> = ({
  data,
  loading = false,
  filterTerm = '',
}) => {
  const [selectedProcess, setSelectedProcess] =
    useState<SelectedProcess | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // List of all process keys (excluding non-process keys)
  const processKeys = [
    'incoming_bahan',
    'potong_bahan',
    'cetak',
    'coating',
    'pond',
    'sortir_rs',
    'sampling_rabut',
    'lem',
    'ampar_lem',
    'potong_jadi',
    'lipat',
    'final_inspection',
  ];

  // Process route mapping
  const processRoutes: { [key: string]: string } = {
    incoming_bahan: '/qc/qualityinspection/history/',
    potong_bahan: '/qc/qualityinspection/prosespotong/bahan/',
    cetak: '/qc/qualityinspection/cetak/jeniscetak/',
    coating: '/qc/qualityinspection/coating/jeniscoating/',
    pond: '/qc/qualityinspection/pond/jenispond/',
    sortir_rs: '/qc/qualityinspection/barangrs/',
    sampling_rabut: '/qc/qualityinspection/sampling/jenis_sampling/checkAwal/',
    lem: '/qc/qualityinspection/lem/jenisLem/',
    ampar_lem: '/qc/qualityinspection/ampar/checkAwal/',
    potong_jadi: '/qc/qualityinspection/prosespotong/jadi/',
    lipat: '/qc/qualityinspection/lipat/',
    final_inspection: '/qc/qualityinspection/final_inspection/checkAwal/',
  };

  // If there's no data or loading is true, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-lg font-medium text-gray-600">
          No data available
        </div>
      </div>
    );
  }

  // Filter data based on filterTerm
  const filteredData = filterTerm
    ? data.filter(
        (item) =>
          String(item.no_jo).toLowerCase().includes(filterTerm.toLowerCase()) ||
          String(item.no_io).toLowerCase().includes(filterTerm.toLowerCase()) ||
          String(item.item).toLowerCase().includes(filterTerm.toLowerCase()),
      )
    : data;

  // Format date values
  const formatDate = (dateStr: any) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID');
    } catch (error) {
      return dateStr;
    }
  };

  // Function to format seconds to "X Jam Y Menit Z Detik"
  const formatSecondsToTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours} Jam ${minutes} Menit ${remainingSeconds} Detik`;
  };

  // Function to format seconds to HH:MM:SS format for the modal
  const formatSecondsToHHMMSS = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to open modal for a specific process
  const openDetailModal = (item: ProcessData, process: string) => {
    setSelectedProcess({
      item,
      process,
      data: Array.isArray(item[process])
        ? (item[process] as ProcessRecord[])
        : [],
    });
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProcess(null);
  };

  // Function to open detail page in new tab
  const openDetailPage = (process: string, id: number | undefined) => {
    if (id === undefined) return;

    const baseUrl = processRoutes[process];
    if (!baseUrl) return;

    const url = `${baseUrl}${id}`;
    window.open(url, '_blank');
  };

  // Function to calculate processing time for a record
  const getRecordProcessingTime = (record: ProcessRecord): number => {
    // If both are available, use lama_pengerjaan
    if (record.lama_pengerjaan && record.waktu_check) {
      return parseFloat(record.lama_pengerjaan) || 0;
    }
    // If only one is available, use that one
    else if (record.lama_pengerjaan) {
      return parseFloat(record.lama_pengerjaan) || 0;
    } else if (record.waktu_check) {
      return parseFloat(record.waktu_check) || 0;
    }
    return 0;
  };

  // Get all field keys from the records to create table headers
  const getFieldKeys = (records: ProcessRecord[]) => {
    if (!records || records.length === 0) return [];

    // Collect all unique keys from all records
    const allKeys = new Set<string>();
    records.forEach((record) => {
      Object.keys(record).forEach((key) => {
        // Skip complex nested objects for table display
        if (typeof record[key] !== 'object' || record[key] === null) {
          allKeys.add(key);
        }
      });
    });

    // Important fields to show first - added inspektor, lama_pengerjaan, waktu_check
    const priorityFields = [
      'id',
      'tanggal',
      'operator',
      'inspektor',
      'status',
      'mesin',
      'jumlah_druk',
      'jumlah_pcs',
      'jumlah_pending',
      'lama_pengerjaan',
      'waktu_check',
      'status_jo',
    ];

    // Sort fields with priority fields first, then alphabetically
    return Array.from(allKeys).sort((a, b) => {
      const indexA = priorityFields.indexOf(a);
      const indexB = priorityFields.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      } else if (indexA !== -1) {
        return -1;
      } else if (indexB !== -1) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
  };

  // Format field value for display
  const formatFieldValue = (key: string, value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }

    if (
      key.includes('tanggal') ||
      key.includes('date') ||
      key === 'createdAt' ||
      key === 'updatedAt'
    ) {
      return formatDate(value);
    }

    // Format time fields (lama_pengerjaan, waktu_check) to HH:MM:SS format
    if (key === 'lama_pengerjaan' || key === 'waktu_check') {
      const seconds = parseFloat(value);
      if (!isNaN(seconds)) {
        return formatSecondsToHHMMSS(seconds);
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Get the latest inspectors across all processes
  const getLatestInspectors = (item: ProcessData) => {
    const inspectors: { [key: string]: string } = {};

    processKeys.forEach((processKey) => {
      const processData = item[processKey];
      if (Array.isArray(processData) && processData.length > 0) {
        // Find the latest record with an inspector or inspektor value
        for (let i = processData.length - 1; i >= 0; i--) {
          if (processData[i].inspector || processData[i].inspektor) {
            // Prioritize inspektor over inspector when both are available
            inspectors[processKey] =
              processData[i].inspektor || processData[i].inspector || '';
            break;
          }
        }
      }
    });

    return inspectors;
  };

  // Render the table header
  const renderTableHeader = (fieldKeys: string[]) => {
    return (
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            #
          </th>
          {fieldKeys.map((key) => (
            <th
              key={key}
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {key.replace(/_/g, ' ')}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Render table rows
  const renderTableRows = (
    records: ProcessRecord[],
    fieldKeys: string[],
    process: string,
  ) => {
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {records.map((record, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          >
            <td className="px-4 py-2 whitespace-nowrap text-sm">
              {record.id && (
                <button
                  onClick={() => openDetailPage(process, record.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
                >
                  <span>Open Detail</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              )}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
              {index + 1}
            </td>
            {fieldKeys.map((key) => (
              <td
                key={key}
                className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
              >
                {key === 'status' ? (
                  <span
                    className={`${
                      String(record[key]).toLowerCase() === 'selesai'
                        ? 'text-green-600 font-medium'
                        : 'text-orange-500 font-medium'
                    }`}
                  >
                    {formatFieldValue(key, record[key])}
                  </span>
                ) : key === 'lama_pengerjaan' || key === 'waktu_check' ? (
                  <span className="text-blue-600">
                    {formatFieldValue(key, record[key])}
                  </span>
                ) : key === 'inspektor' || key === 'operator' ? (
                  <span className="font-medium">
                    {formatFieldValue(key, record[key])}
                  </span>
                ) : (
                  formatFieldValue(key, record[key])
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Render complex nested objects
  const renderNestedObject = (obj: any, parentKey: string = '') => {
    if (!obj || typeof obj !== 'object') return null;

    return (
      <div className="pl-4 border-l-2 border-gray-300 mt-2">
        {Object.entries(obj).map(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;

          if (typeof value === 'object' && value !== null) {
            return (
              <div key={fullKey} className="mb-2">
                <span className="font-medium capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                {renderNestedObject(value, fullKey)}
              </div>
            );
          }

          return (
            <div key={fullKey} className="mb-1">
              <span className="font-medium capitalize">
                {key.replace(/_/g, ' ')}:
              </span>{' '}
              {formatFieldValue(key, value)}
            </div>
          );
        })}
      </div>
    );
  };

  // Render the modal with table structure
  const renderModal = () => {
    if (!showModal || !selectedProcess) return null;

    const { item, process, data } = selectedProcess;
    const fieldKeys = getFieldKeys(data);
    const hasComplexData = data.some((record) =>
      Object.values(record).some(
        (value) => typeof value === 'object' && value !== null,
      ),
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-6xl max-h-screen overflow-auto">
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-lg font-bold capitalize">
              {process.replace(/_/g, ' ')} Details for {String(item.item)} (JO:{' '}
              {String(item.no_jo)})
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {renderTableHeader(fieldKeys)}
                  {renderTableRows(data, fieldKeys, process)}
                </table>

                {/* Display nested objects separately if they exist */}
                {hasComplexData && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-gray-700 mb-3">
                      Additional Complex Data
                    </h4>
                    {data.map((record, index) => {
                      const complexFields = Object.entries(record).filter(
                        ([_, value]) =>
                          typeof value === 'object' && value !== null,
                      );

                      if (complexFields.length === 0) return null;

                      return (
                        <div key={index} className="mb-4 p-3 border rounded">
                          <h5 className="font-medium mb-2">
                            Record {index + 1} - Complex Fields:
                          </h5>
                          {complexFields.map(([key, value]) => (
                            <div key={key} className="mb-3">
                              <span className="font-medium capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              {renderNestedObject(value)}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 text-center rounded">
                No data available for this process. This information may be
                added in the future.
              </div>
            )}
          </div>

          <div className="p-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {filteredData.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded text-center">
          No matching data found
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredData.map((item: any, index) => {
            // Get all latest inspectors for this item
            const latestInspectors = getLatestInspectors(item);

            return (
              <div
                key={index}
                className="mb-4 border rounded-lg shadow-sm w-full"
              >
                {/* Full-width header with JO info */}
                <div className="bg-blue-50 p-3 border-b rounded-t-lg">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">
                        <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-center text-xs leading-6 mr-2">
                          {index + 1}
                        </span>
                        {item.item}
                      </h2>
                      <div className="flex gap-4 text-sm">
                        <div className="px-2 py-1 bg-blue-100 rounded">
                          <span className="font-semibold">JO:</span>{' '}
                          {item.no_jo}
                        </div>
                        <div className="px-2 py-1 bg-blue-100 rounded">
                          <span className="font-semibold">IO:</span>{' '}
                          {item.no_io}
                        </div>
                      </div>
                    </div>

                    {/* Row for total processing time across all processes */}
                    <div className="flex justify-between items-center text-sm">
                      {/* Display latest inspectors in a scrollable row */}

                      <div className="flex gap-4">
                        {(() => {
                          // Calculate total processing time from all records in seconds
                          let totalSeconds = 0;

                          processKeys.forEach((processKey) => {
                            const processData = item[processKey];
                            if (Array.isArray(processData)) {
                              processData.forEach((record) => {
                                // Add processing time using our helper function
                                totalSeconds += getRecordProcessingTime(record);
                              });
                            }
                          });

                          if (totalSeconds > 0) {
                            return (
                              <div className="px-2 py-1 bg-green-100 rounded">
                                <span className="font-semibold">
                                  Total Waktu Pengerjaan:
                                </span>{' '}
                                {formatSecondsToTime(totalSeconds)}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Single row for process boxes */}
                <div className="p-3">
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {processKeys.map((processKey) => {
                      const processData = item[processKey];
                      const isEmpty =
                        !processData ||
                        (Array.isArray(processData) &&
                          processData.length === 0);
                      const hasData =
                        Array.isArray(processData) && processData.length > 0;

                      // Get the latest record data for preview (if exists)
                      const latestRecord = hasData
                        ? processData[processData.length - 1]
                        : null;

                      // Get the latest inspector for this process
                      const latestInspector =
                        latestInspectors[processKey] || null;

                      return (
                        <div
                          key={processKey}
                          className={`border rounded ${
                            hasData
                              ? 'bg-green-50 border-green-200'
                              : 'bg-black text-white'
                          }`}
                        >
                          <div className="p-2">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-medium capitalize text-xs">
                                {processKey.replace(/_/g, ' ')}
                              </h3>
                              <span
                                className={`px-1 py-0.5 text-xs rounded-full ${
                                  hasData
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-700 text-gray-300'
                                }`}
                              >
                                {hasData ? `${processData.length}` : '0'}
                              </span>
                            </div>

                            {hasData && latestRecord && (
                              <div className="border-t border-green-200 mt-1 pt-1 text-xs text-gray-600">
                                {latestRecord.tanggal && (
                                  <div className="mb-1">
                                    <span className="font-medium">
                                      Tanggal:
                                    </span>{' '}
                                    {formatDate(latestRecord.tanggal)}
                                  </div>
                                )}
                                {/* Display latest inspector if available */}
                                {latestInspector && (
                                  <div className="mb-1">
                                    <span className="font-medium">
                                      Inspektor:
                                    </span>{' '}
                                    <span className="text-purple-700 font-medium">
                                      {latestInspector}
                                    </span>
                                  </div>
                                )}
                                {latestRecord.operator && (
                                  <div className="mb-1">
                                    <span className="font-medium">
                                      Operator:
                                    </span>{' '}
                                    {latestRecord.operator}
                                  </div>
                                )}
                                {latestRecord.mesin && (
                                  <div className="mb-1">
                                    <span className="font-medium">Mesin:</span>{' '}
                                    {latestRecord.mesin}
                                  </div>
                                )}
                                {latestRecord.status && (
                                  <div className="mb-1">
                                    <span className="font-medium">Status:</span>{' '}
                                    <span
                                      className={`${
                                        latestRecord.status.toLowerCase() ===
                                        'selesai'
                                          ? 'text-green-600 font-medium'
                                          : 'text-orange-500 font-medium'
                                      }`}
                                    >
                                      {latestRecord.status}
                                    </span>
                                  </div>
                                )}
                                {/* Calculate and display total processing time for this process */}
                                {(() => {
                                  if (!Array.isArray(processData)) return null;

                                  let totalSeconds = 0;
                                  processData.forEach((record) => {
                                    // Add processing time using our helper function
                                    totalSeconds +=
                                      getRecordProcessingTime(record);
                                  });

                                  if (totalSeconds > 0) {
                                    return (
                                      <div className="mb-1">
                                        <span className="font-medium">
                                          Waktu:
                                        </span>{' '}
                                        <span className="text-blue-600">
                                          {formatSecondsToTime(totalSeconds)}
                                        </span>
                                      </div>
                                    );
                                  }

                                  return null;
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="flex border-t">
                            <button
                              onClick={() => openDetailModal(item, processKey)}
                              className={`py-1 text-xs hover:bg-blue-700 ${
                                hasData
                                  ? 'w-1/2 bg-blue-600 text-white rounded-bl'
                                  : 'w-full text-center text-gray-400 border-gray-600'
                              }`}
                              disabled={!hasData}
                            >
                              {hasData ? 'View Details' : 'No data'}
                            </button>

                            {hasData && latestRecord && latestRecord.id && (
                              <button
                                onClick={() =>
                                  openDetailPage(processKey, latestRecord.id)
                                }
                                className="w-1/2 py-1 bg-green-600 text-white rounded-br text-xs hover:bg-green-700 flex items-center justify-center"
                              >
                                <span>Open</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 ml-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default ProcessTable;
