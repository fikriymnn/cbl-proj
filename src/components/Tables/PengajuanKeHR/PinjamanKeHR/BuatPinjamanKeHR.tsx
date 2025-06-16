import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  User,
  CreditCard,
  Calendar,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  Building,
} from 'lucide-react';
import Select from 'react-select';

function BuatPinjamanKeHR() {
  const [options, setOptions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>([]);
  const [me, setMe] = useState<any>(null);
  const [idPengaju, setIdPengaju] = useState<any>(null);
  const [statusPinjaman, setStatusPinjaman] = useState<any>(false);
  const [tipeCicilan, settipeCicilan] = useState<any>('');
  const [idKaryawan, setIdKaryawan] = useState<any>('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Form fields
  const [keperluanPinjaman, setKeperluanPinjaman] = useState<any>('');
  const [jumlahPinjaman, setJumlahPinjaman] = useState<any>('');
  const [jumlahCicilan, setJumlahCicilan] = useState<any>(0);
  const [tempoCicilan, setTempoCicilan] = useState<any>('');
  const [jaminanPinjaman, setJaminanPinjaman] = useState<any>('');
  const [limit, setLimit] = useState<any>(0);

  useEffect(() => {
    getMe();
  }, []);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);
      getMasterUser(res?.data.karyawan.biodata_karyawan[0]?.id_department);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const getMasterUser = async (id: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: { is_active: true, id_department: id },
        withCredentials: true,
      });

      setUserList(res.data.data);
      setOptions(
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Fixed handleEmployeeSelect function for react-select
  const handleEmployeeSelect = (selectedOption: any) => {
    if (!selectedOption) {
      setSelectedEmployee(null);
      setStatusPinjaman(false);
      setLimit(0);
      setIdKaryawan('');
      settipeCicilan('');
      return;
    }

    const filteredData = userList.find(
      (item: any) => item.userid == selectedOption.value,
    );

    if (filteredData) {
      setSelectedEmployee(filteredData);
      setIdKaryawan(filteredData.userid);

      const hasBelumLunasPinjaman =
        filteredData?.biodata_karyawan[0]?.status_pinajaman?.some(
          (pinjaman: any) => pinjaman.status_pinjaman === 'belum lunas',
        );

      setStatusPinjaman(hasBelumLunasPinjaman);
      settipeCicilan(filteredData.biodata_karyawan[0]?.tipe_penggajian);
      setLimit(filteredData.biodata_karyawan[0]?.limit_pinjaman);
    }
  };

  const handleSubmit = async () => {
    if (!jumlahPinjaman) {
      alert('Jumlah Pinjaman Belum Diisi');
      return;
    }
    if (!tempoCicilan) {
      alert('Tempo Cicilan Belum Diisi');
      return;
    }
    if (!jaminanPinjaman) {
      alert('Jaminan Pinjaman Belum Diisi');
      return;
    }
    if (!keperluanPinjaman) {
      alert('Keperluan Pinjaman Belum Diisi');
      return;
    }

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPinjaman`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          jumlah_pinjaman: jumlahPinjaman,
          jumlah_cicilan: jumlahCicilan,
          tempo_cicilan: tempoCicilan,
          tipe_cicilan: tipeCicilan,
          jaminan_pinjaman: jaminanPinjaman,
          keperluan_pinjaman: keperluanPinjaman,
        },
        {
          withCredentials: true,
        },
      );

      setIsLoading(false);

      // Show success alert
      alert('Pengajuan Pinjaman Berhasil');

      // Clear form
      setSelectedEmployee(null);
      setStatusPinjaman(false);

      setIdKaryawan('');
      setKeperluanPinjaman('');
      setJumlahPinjaman('');
      setJumlahCicilan(0);
      setTempoCicilan('');
      setJaminanPinjaman('');
      setLimit(0);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (jumlahPinjaman > 0 && tempoCicilan > 0) {
      const calculatedJumlahCicilan = jumlahPinjaman / tempoCicilan;
      setJumlahCicilan(calculatedJumlahCicilan);
    } else {
      setJumlahCicilan(0);
    }
  }, [jumlahPinjaman, tempoCicilan]);

  const formatCurrency = (amount: any) => {
    return `Rp ${amount?.toLocaleString('id-ID')}`;
  };

  const isFormValid =
    selectedEmployee &&
    !statusPinjaman &&
    jumlahPinjaman &&
    tempoCicilan &&
    jaminanPinjaman &&
    keperluanPinjaman;

  // Custom styles for react-select to make it work better in your design
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(4px)',
      padding: '8px',
      minHeight: '48px',
      '&:hover': {
        borderColor: 'white',
      },
      boxShadow: state.isFocused
        ? '0 0 0 2px rgba(255, 255, 255, 0.2)'
        : 'none',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.7)',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? '#eff6ff'
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: '#eff6ff',
        color: '#374151',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-2xl">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-blue-600 font-medium">
                  Memproses pengajuan...
                </p>
              </div>
            </div>
          )}

          <div className="relative">
            {/* Employee Selection Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <div className="bg-gradient-to-r  text-white">
                <h2 className="text-2xl font-bold  flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pengajuan Pinjaman Karyawan
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Selection Section */}
                <div className="p-6 border-b border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
                      👤 Nama Karyawan
                    </label>
                  </div>
                  <div className="relative">
                    <Select
                      placeholder="Cari karyawan..."
                      options={options}
                      onChange={handleEmployeeSelect}
                      isClearable
                      isSearchable
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  {selectedEmployee && !statusPinjaman && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                        <span className="text-sm font-medium text-blue-100">
                          Limit Tersedia
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(limit)}
                      </p>
                    </div>
                  )}

                  {statusPinjaman && (
                    <div className="bg-red-500 bg-opacity-20 rounded-lg p-4 border border-red-300">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-300 mr-2" />
                        <span className="text-red-200 font-medium">
                          Karyawan memiliki pinjaman yang belum lunas
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Detail Pinjaman
                    </h3>
                  </div>

                  {/* Jumlah Pinjaman */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Jumlah Pinjaman
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={
                          jumlahPinjaman
                            ? jumlahPinjaman.toLocaleString('id-ID')
                            : ''
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          setJumlahPinjaman(value ? parseInt(value) : '');
                        }}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="0"
                        disabled={!selectedEmployee || statusPinjaman}
                      />
                    </div>
                  </div>

                  {/* Tempo and Cicilan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Tempo Cicilan (
                        {tipeCicilan === 'bulanan' ? 'Bulan' : 'Minggu'})
                      </label>
                      <input
                        type="number"
                        value={tempoCicilan}
                        onChange={(e) => setTempoCicilan(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder={`Total ${
                          tipeCicilan === 'bulanan' ? 'bulan' : 'minggu'
                        }`}
                        disabled={!selectedEmployee || statusPinjaman}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Jumlah Cicilan
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={
                            jumlahCicilan
                              ? jumlahCicilan.toLocaleString('id-ID')
                              : '0'
                          }
                          readOnly
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Jaminan */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Jaminan Pinjaman
                    </label>
                    <input
                      type="text"
                      value={jaminanPinjaman}
                      onChange={(e) => setJaminanPinjaman(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Contoh: BPKB Motor, Sertifikat Tanah, dll"
                      disabled={!selectedEmployee || statusPinjaman}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Keperluan Pinjaman
                    </h3>
                  </div>

                  <div className="h-full">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Jelaskan keperluan pinjaman secara detail
                    </label>
                    <textarea
                      value={keperluanPinjaman}
                      onChange={(e) => setKeperluanPinjaman(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      placeholder="Contoh: Untuk biaya renovasi rumah, kebutuhan mendesak keluarga, modal usaha, dll."
                      disabled={!selectedEmployee || statusPinjaman}
                    />
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              {selectedEmployee &&
                !statusPinjaman &&
                jumlahPinjaman &&
                tempoCicilan && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">
                      Ringkasan Pinjaman
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-blue-600 text-sm font-medium">
                          Jumlah Pinjaman
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatCurrency(jumlahPinjaman)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 text-sm font-medium">
                          Cicilan per{' '}
                          {tipeCicilan === 'bulanan' ? 'Bulan' : 'Minggu'}
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatCurrency(jumlahCicilan)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 text-sm font-medium">
                          Jangka Waktu
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                          {tempoCicilan}{' '}
                          {tipeCicilan === 'bulanan' ? 'Bulan' : 'Minggu'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                {!statusPinjaman && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid || isLoading}
                    className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      isFormValid && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </div>
                    ) : (
                      'AJUKAN PINJAMAN'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuatPinjamanKeHR;
