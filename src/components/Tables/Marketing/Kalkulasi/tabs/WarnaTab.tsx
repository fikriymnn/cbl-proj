import React, { useEffect } from 'react';
import { KalkulasiFormData } from '../KalkulasiModal';

interface WarnaTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

const WarnaTab: React.FC<WarnaTabProps> = ({ formData, onInputChange }) => {
  // Calculate Jumlah Warna based on the formula
  const calculateJumlahWarna = () => {
    const warnaDepan = Number(formData.warna_depan) || 0;
    const warnaBelakang = Number(formData.warna_belakang) || 0;
    const isBBSYes = formData.ukuran_cetak_bbs_1?.toLowerCase() === 'yes';

    const totalWarna = warnaDepan + warnaBelakang;

    if (isBBSYes) {
      return totalWarna * 0.75;
    } else {
      return totalWarna;
    }
  };

  // Update jumlah_warna whenever warna_depan, warna_belakang, or ukuran_cetak_bbs_1 changes
  useEffect(() => {
    const jumlahWarna = calculateJumlahWarna();

    // Create a synthetic event to update the form data
    const syntheticEvent = {
      target: {
        name: 'jumlah_warna',
        value: jumlahWarna.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onInputChange(syntheticEvent);
  }, [
    formData.warna_depan,
    formData.warna_belakang,
    formData.ukuran_cetak_bbs_1,
  ]);

  return (
    <div className="space-y-8">
      {/* Warna Cetakan Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-6 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"
            />
          </svg>
          Warna Cetakan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Warna Depan */}
          <div className="space-y-2 flex flex-col justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Warna Depan
            </label>
            <input
              type="number"
              name="warna_depan"
              value={formData.warna_depan || '0'}
              onChange={onInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="0"
              placeholder="Masukkan jumlah warna depan"
            />
          </div>

          {/* Warna Belakang */}
          <div className="space-y-2 flex flex-col justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Warna Belakang
            </label>
            <input
              type="number"
              name="warna_belakang"
              value={formData.warna_belakang || '0'}
              onChange={onInputChange}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="0"
              placeholder="Masukkan jumlah warna belakang"
            />
          </div>

          {/* Jumlah Warna (Read-only, calculated field) */}
          <div className="space-y-2 flex flex-col justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Jumlah Warna
              <span className="text-xs text-gray-500 block mt-1">
                {formData.ukuran_cetak_bbs_1?.toLowerCase() === 'yes'
                  ? '(Depan + Belakang) / 0.75 (BBS)'
                  : 'Depan + Belakang'}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="jumlah_warna"
                value={calculateJumlahWarna().toFixed(2)}
                readOnly
                className="w-full px-2 py-1 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Otomatis terhitung"
              />
              <div className="absolute right-3 top-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Ringkasan Warna
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-600 font-semibold text-lg">
              {formData.warna_depan || '0'}
            </div>
            <div className="text-red-500 text-sm">Warna Depan</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 font-semibold text-lg">
              {formData.warna_belakang || '0'}
            </div>
            <div className="text-blue-500 text-sm">Warna Belakang</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 font-semibold text-lg">
              {calculateJumlahWarna().toFixed(2)}
            </div>
            <div className="text-green-500 text-sm">Total Jumlah Warna</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarnaTab;
