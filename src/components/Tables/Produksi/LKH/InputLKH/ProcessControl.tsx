import React from 'react';
import Select from 'react-select';
import { ProcessData, KodeProduksi, LKHProses, Option } from './types';
import { FIXED_PROCESSES } from './constants';
import { selectStyles } from './styles';

interface ProcessControlProps {
  selectedTahapan: number | null;
  selectedMesin: string;
  loading: boolean;
  hasActiveProcess: boolean;
  kodeProduksiByProcess: { [key: string]: KodeProduksi[] };
  activeProcesses: { [key: string]: LKHProses };
  processDataList: { [key: string]: ProcessData };
  onStartProcess: (processName: string) => void;
  onStopProcess: (processName: string) => void;
  onProcessDataChange: (
    processName: string,
    field: keyof ProcessData,
    value: string | number,
  ) => void;
  onFinish: () => void;
}

const ProcessControl: React.FC<ProcessControlProps> = ({
  selectedTahapan,
  selectedMesin,
  loading,
  hasActiveProcess,
  kodeProduksiByProcess,
  activeProcesses,
  processDataList,
  onStartProcess,
  onStopProcess,
  onProcessDataChange,
  onFinish,
}) => {
  const isProcessActive = (processName: string) => {
    return !!activeProcesses[processName];
  };

  if (!selectedTahapan || !selectedMesin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            Kontrol Proses Produksi
          </h2>
        </div>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Belum ada data proses
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Silakan pilih JO, Proses, dan Mesin terlebih dahulu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <h2 className="text-base font-semibold text-gray-800">
          Kontrol Proses Produksi
        </h2>
        {hasActiveProcess && (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Proses Berjalan
          </span>
        )}
      </div>

      <div className="space-y-2">
        {FIXED_PROCESSES.map((process) => {
          const isActive = isProcessActive(process.name);
          const processData = processDataList[process.name] || {
            detail: '',
            baik: 0,
            rusak_sebagian: 0,
            rusak_total: 0,
            pallet: 0,
            note: '',
          };

          const kodeProduksiOptions = (
            kodeProduksiByProcess[process.name] || []
          ).map((kode) => ({
            value: String(kode.id),
            label: `${kode.kode} - ${kode.deskripsi}`,
          }));

          return (
            <div
              key={process.name}
              className={`border rounded-lg p-2 transition-all ${
                isActive
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  <h3 className="font-semibold text-sm text-gray-800">
                    {process.name}
                  </h3>
                  {isActive && activeProcesses[process.name] && (
                    <span className="text-xs text-gray-600">
                      ({activeProcesses[process.name].kode} -{' '}
                      {activeProcesses[process.name].deskripsi})
                    </span>
                  )}
                </div>
                {isActive ? (
                  <button
                    onClick={() => onStopProcess(process.name)}
                    className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={loading}
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => onStartProcess(process.name)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={
                      loading ||
                      hasActiveProcess ||
                      !selectedMesin ||
                      !processData.detail
                    }
                  >
                    Start
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {/* First Row: Detail and Keterangan */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Detail */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Detail <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={kodeProduksiOptions}
                      value={
                        processData.detail
                          ? kodeProduksiOptions.find(
                              (opt) => opt.value === processData.detail,
                            )
                          : null
                      }
                      onChange={(option) =>
                        onProcessDataChange(
                          process.name,
                          'detail',
                          option ? option.value : '',
                        )
                      }
                      styles={selectStyles}
                      placeholder="Pilih Detail"
                      isDisabled={isActive}
                      isClearable
                      noOptionsMessage={() => 'Tidak ada data'}
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      value={processData.note}
                      onChange={(e) =>
                        onProcessDataChange(
                          process.name,
                          'note',
                          e.target.value,
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!isActive}
                      placeholder="Catatan"
                    />
                  </div>
                </div>

                {/* Second Row: Number Inputs */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Baik */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Baik
                    </label>
                    <input
                      type="number"
                      value={processData.baik || ''}
                      onChange={(e) =>
                        onProcessDataChange(
                          process.name,
                          'baik',
                          e.target.value ? Number(e.target.value) : 0,
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!isActive}
                      placeholder="0"
                    />
                  </div>

                  {/* Rusak Sebagian */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Rusak Sebagian
                    </label>
                    <input
                      type="number"
                      value={processData.rusak_sebagian || ''}
                      onChange={(e) =>
                        onProcessDataChange(
                          process.name,
                          'rusak_sebagian',
                          e.target.value ? Number(e.target.value) : 0,
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!isActive}
                      placeholder="0"
                    />
                  </div>

                  {/* Rusak Total */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Rusak Total
                    </label>
                    <input
                      type="number"
                      value={processData.rusak_total || ''}
                      onChange={(e) =>
                        onProcessDataChange(
                          process.name,
                          'rusak_total',
                          e.target.value ? Number(e.target.value) : 0,
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!isActive}
                      placeholder="0"
                    />
                  </div>

                  {/* Pallet */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Pallet
                    </label>
                    <input
                      type="number"
                      value={processData.pallet || ''}
                      onChange={(e) =>
                        onProcessDataChange(
                          process.name,
                          'pallet',
                          e.target.value ? Number(e.target.value) : 0,
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!isActive}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
        <button
          onClick={onFinish}
          className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={hasActiveProcess}
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default ProcessControl;
