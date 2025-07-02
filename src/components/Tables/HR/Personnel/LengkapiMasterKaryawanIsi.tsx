import React, { useState, useEffect } from 'react';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';

function LengkapiMasterKaryawanIsi() {
  const [activeTab, setActiveTab] = useState('informasi');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get employee ID from URL params
  const employeeId = window.location.pathname.split('/').pop();

  // State for Detail Informasi (original data from API)
  const [originalData, setOriginalData] = useState<any>(null);
  const [biodataKaryawan, setbiodataKaryawan] = useState<any>(null);
  // State for Detail Informasi (form data)
  const [detailInformasi, setDetailInformasi] = useState({
    id_karyawan: '',
    id_biodata_karyawan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: '',
    golongan_darah: '',
    kewarganegaraan: 'WNI',
    alamat: '',
    telepon: '',
    hp: '',
    email: '',
    no_npwp: '',
    nama_npwp: '',
    alamat_npwp: '',
    tanggal_terdaftar_npwp: '',
    no_ktp: '',
    masa_berlaku_ktp: '',
    no_jamsotek: '',
    sim_1: '',
    sim_2: '',
    is_jpk_khusus: false,
  });
  useEffect(() => {
    // Only fetch if we have a valid ID
    if (employeeId) {
      getKaryawan();
    }
  }, [employeeId]);

  async function getKaryawan() {
    if (!employeeId) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${employeeId}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setbiodataKaryawan(res.data.data.biodata_karyawan[0].id);
    } catch (error: any) {
      console.error('Error fetching karyawan data:', error);
    }
  }

  const fetchDetailInformasi = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanDetailInformasi`;
    try {
      const response = await axios.get(url, {
        params: { id_karyawan: employeeId },
        withCredentials: true,
      });

      console.log('Response data:', response.data.data);
      console.log(
        'Employee ID from params:',
        employeeId,
        'Type:',
        typeof employeeId,
      );

      if (
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        // More robust filtering - try multiple comparison methods
        const filteredData = response.data.data.filter((item: any) => {
          const itemIdKaryawan = item.id_karyawan;
          const paramEmployeeId = employeeId;

          console.log('Comparing:', {
            itemIdKaryawan,
            paramEmployeeId,
            itemType: typeof itemIdKaryawan,
            paramType: typeof paramEmployeeId,
            numberComparison:
              Number(itemIdKaryawan) === Number(paramEmployeeId),
            stringComparison:
              String(itemIdKaryawan) === String(paramEmployeeId),
            strictComparison: itemIdKaryawan === paramEmployeeId,
          });

          // Try multiple comparison methods
          return (
            Number(itemIdKaryawan) === Number(paramEmployeeId) ||
            String(itemIdKaryawan) === String(paramEmployeeId) ||
            itemIdKaryawan == paramEmployeeId // Loose equality
          );
        });

        console.log('Filtered data:', filteredData);
        console.log('Filtered data length:', filteredData.length);

        if (filteredData.length > 0) {
          // Sort by created_at, updated_at, or id (whichever exists) to get the latest record
          const latestRecord = filteredData.sort((a: any, b: any) => {
            // First try to sort by updated_at if it exists
            if (a.updatedAt && b.updatedAt) {
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            }
            // Then try created_at if it exists
            if (a.createdAt && b.createdAt) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            // Finally fallback to id if it exists (assuming higher id = newer)
            if (a.id && b.id) {
              return b.id - a.id;
            }
            // If no timestamp fields, return the first one
            return 0;
          })[0];

          console.log('Latest record selected:', latestRecord);
          setOriginalData(latestRecord);
          setDetailInformasi(latestRecord);
        } else {
          console.log('No matching records found after filtering');
          // No matching records found
          setOriginalData(null);
          setDetailInformasi({
            id_karyawan: '',
            id_biodata_karyawan: '',
            tempat_lahir: '',
            tanggal_lahir: '',
            agama: '',
            golongan_darah: '',
            kewarganegaraan: 'WNI',
            alamat: '',
            telepon: '',
            hp: '',
            email: '',
            no_npwp: '',
            nama_npwp: '',
            alamat_npwp: '',
            tanggal_terdaftar_npwp: '',
            no_ktp: '',
            masa_berlaku_ktp: '',
            no_jamsotek: '',
            sim_1: '',
            sim_2: '',
            is_jpk_khusus: false,
          });
        }
      } else {
        console.log('No data in response or empty array');
        setOriginalData(null);
        // Reset form with default values if no data exists
        setDetailInformasi({
          id_karyawan: '',
          id_biodata_karyawan: '',
          tempat_lahir: '',
          tanggal_lahir: '',
          agama: '',
          golongan_darah: '',
          kewarganegaraan: 'WNI',
          alamat: '',
          telepon: '',
          hp: '',
          email: '',
          no_npwp: '',
          nama_npwp: '',
          alamat_npwp: '',
          tanggal_terdaftar_npwp: '',
          no_ktp: '',
          masa_berlaku_ktp: '',
          no_jamsotek: '',
          sim_1: '',
          sim_2: '',
          is_jpk_khusus: false,
        });
      }
    } catch (error) {
      console.error('Error fetching detail informasi:', error);
      setOriginalData(null);
      alert('Gagal memuat data detail informasi atau data belum ada');
    } finally {
      setLoading(false);
    }
  };

  const saveDetailInformasi = async () => {
    setSaving(true);

    try {
      //Validate required fields before sending
      if (!detailInformasi.tempat_lahir || !detailInformasi.tanggal_lahir) {
        alert('Tempat lahir dan tanggal lahir harus diisi');
        setSaving(false);
        return;
      }

      let response;

      if (originalData && originalData.id_karyawan) {
        // Update existing data using PUT
        // Make sure to use the correct ID for the update
        const updateUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailInformasi/${originalData.id || employeeId}`;

        console.log('Updating data to:', updateUrl);
        console.log('Update payload:', detailInformasi);

        response = await axios.put(updateUrl, detailInformasi, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Update response:', response.data);
        alert('Data berhasil diperbarui');
      } else {
        // Create new data using POST
        const createUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailInformasi`;

        const createPayload = {
          ...detailInformasi,
          id_karyawan: employeeId,
          id_biodata_karyawan: biodataKaryawan,
        };

        console.log('Creating data to:', createUrl);
        console.log('Create payload:', createPayload);

        response = await axios.post(createUrl, createPayload, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Create response:', response.data);
        alert('Data berhasil disimpan');
      }

      // Refresh data after successful save
      await fetchDetailInformasi();
      setIsEditing(false); // Exit edit mode
    } catch (error: any) {
      console.error('Error saving detail informasi:', error);

      // Better error handling
      if (error.response) {
        // Server responded with error status
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        if (error.response.status === 400) {
          alert(
            `Gagal menyimpan data: ${
              error.response.data.message || 'Data tidak valid'
            }`,
          );
        } else if (error.response.status === 401) {
          alert('Sesi Anda telah berakhir. Silakan login kembali.');
        } else if (error.response.status === 404) {
          alert('Endpoint tidak ditemukan. Periksa URL API.');
        } else if (error.response.status === 500) {
          alert('Terjadi kesalahan server. Silakan coba lagi nanti.');
        } else {
          alert(
            `Gagal menyimpan data: ${
              error.response.data.message || 'Terjadi kesalahan tidak dikenal'
            }`,
          );
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        // Other error
        console.error('Error:', error.message);
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle input change for detail informasi
  const handleDetailInformasiChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setDetailInformasi((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (originalData) {
      setDetailInformasi(originalData);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDetailInformasi();
  }, [employeeId]);

  const tabs = [
    { id: 'informasi', label: 'Detail Informasi', icon: '👤' },
    { id: 'keluarga', label: 'Detail Keluarga', icon: '👨‍👩‍👧‍👦' },
    { id: 'pendidikan', label: 'Riwayat Pendidikan', icon: '🎓' },
    { id: 'pekerjaan', label: 'Riwayat Pekerjaan', icon: '💼' },
  ];

  // Render data display (read-only)
  const renderDataDisplay = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Display */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.tempat_lahir || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {convertTimeStampToDateOnly(originalData?.tanggal_lahir) || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.agama || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.golongan_darah || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kewarganegaraan
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.kewarganegaraan || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Display */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Kontak
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 min-h-[76px]">
                {originalData?.alamat || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.telepon || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HP
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.hp || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.email || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NPWP Information Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi NPWP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.nama_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.alamat_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Terdaftar NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {convertTimeStampToDateOnly(
                originalData?.tanggal_terdaftar_npwp,
              ) || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Information Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi Dokumen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. KTP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_ktp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Berlaku KTP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {convertTimeStampToDateOnly(originalData?.masa_berlaku_ktp) ||
                '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Jamsotek
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_jamsotek || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JPK Khusus
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.is_jpk_khusus ? 'Ya' : 'Tidak'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 1
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.sim_1 || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 2
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.sim_2 || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons for Display Mode */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleEdit}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
        >
          Edit Data
        </button>
      </div>
    </div>
  );

  // Render form (editable)
  const renderDetailInformasi = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempat_lahir"
                value={detailInformasi.tempat_lahir}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan tempat lahir"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggal_lahir"
                value={detailInformasi.tanggal_lahir}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <select
                name="agama"
                value={detailInformasi.agama}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <select
                name="golongan_darah"
                value={detailInformasi.golongan_darah}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kewarganegaraan
              </label>
              <select
                name="kewarganegaraan"
                value={detailInformasi.kewarganegaraan}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Kontak
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={detailInformasi.alamat}
                onChange={handleDetailInformasiChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <input
                type="text"
                name="telepon"
                value={detailInformasi.telepon}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor telepon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HP
              </label>
              <input
                type="text"
                name="hp"
                value={detailInformasi.hp}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor HP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={detailInformasi.email}
                onChange={handleDetailInformasiChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* NPWP Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi NPWP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. NPWP
            </label>
            <input
              type="text"
              name="no_npwp"
              value={detailInformasi.no_npwp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama NPWP
            </label>
            <input
              type="text"
              name="nama_npwp"
              value={detailInformasi.nama_npwp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama sesuai NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat NPWP
            </label>
            <input
              type="text"
              name="alamat_npwp"
              value={detailInformasi.alamat_npwp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat sesuai NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Terdaftar NPWP
            </label>
            <input
              type="date"
              name="tanggal_terdaftar_npwp"
              value={detailInformasi.tanggal_terdaftar_npwp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi Dokumen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. KTP
            </label>
            <input
              type="text"
              name="no_ktp"
              value={detailInformasi.no_ktp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor KTP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Berlaku KTP
            </label>
            <input
              type="date"
              name="masa_berlaku_ktp"
              value={detailInformasi.masa_berlaku_ktp}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Jamsotek
            </label>
            <input
              type="text"
              name="no_jamsotek"
              value={detailInformasi.no_jamsotek}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor Jamsotek"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_jpk_khusus"
                checked={detailInformasi.is_jpk_khusus}
                onChange={handleDetailInformasiChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                JPK Khusus
              </span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 1
            </label>
            <input
              type="text"
              name="sim_1"
              value={detailInformasi.sim_1}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor SIM 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 2
            </label>
            <input
              type="text"
              name="sim_2"
              value={detailInformasi.sim_2}
              onChange={handleDetailInformasiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor SIM 2"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons for Edit Mode */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancelEdit}
          disabled={saving}
          className="bg-red-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
        >
          Batal
        </button>
        <button
          onClick={saveDetailInformasi}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
        >
          {saving
            ? 'Menyimpan...'
            : originalData
            ? 'Update Data'
            : 'Simpan Data'}
        </button>
      </div>
    </div>
  );

  const renderPlaceholderTab = (tabName: any) => (
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <div className="text-gray-400 text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        {tabName} - Coming Soon
      </h3>
      <p className="text-gray-500">
        Fitur ini akan segera tersedia. Silakan gunakan tab Detail Informasi
        untuk saat ini.
      </p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informasi':
        return isEditing ? renderDetailInformasi() : renderDataDisplay();
      case 'keluarga':
        return renderPlaceholderTab('Detail Keluarga');
      case 'pendidikan':
        return renderPlaceholderTab('Riwayat Pendidikan');
      case 'pekerjaan':
        return renderPlaceholderTab('Riwayat Pekerjaan');
      default:
        return isEditing ? renderDetailInformasi() : renderDataDisplay();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lengkapi Master Karyawan
          </h1>
          <p className="text-gray-600">
            Kelola informasi lengkap karyawan ID: {employeeId}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}

export default LengkapiMasterKaryawanIsi;
