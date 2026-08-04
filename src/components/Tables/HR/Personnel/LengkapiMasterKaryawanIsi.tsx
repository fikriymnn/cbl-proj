import React, { useState, useEffect } from 'react';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import DetailInformasiDisplay from './DetailInformasiDisplay';
import DetailInformasiForm from './DetailInformasiForm';
import DetailKeluargaDisplay from './DetailKeluargaDisplay';
import DetailKeluargaForm from './DetailKeluargaForm';
import Loading from '../../../Loading';
import DetailPendidikanDisplay from './DetailPendidikanDisplay';
import DetailPendidikanForm from './DetailPendidikanForm';
import DetailPekerjaanDisplay from './DetailPekerjaanDisplay';
import DetailPekerjaanForm from './DetailPekerjaanForm';

interface RiwayatPekerjaan {
  id?: number;
  id_karyawan: string;
  id_biodata_karyawan: string;
  dari_tahun: string;
  dari_bulan: string;
  sampai_tahun: string;
  sampai_bulan: string;
  nama_perusahaan: string;
  jabatan: string;
  keterangan: string;
}
interface RiwayatPendidikan {
  id?: number;
  id_karyawan: string;
  id_biodata_karyawan: string;
  tingkat: string;
  nama_sekolah: string;
  kota: string;
  jurusan: string;
  tahun_lulus: string;
  berijazah: string;
}
interface DetailInformasi {
  id_karyawan: string;
  id_biodata_karyawan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  golongan_darah: string;
  kewarganegaraan: string;
  alamat: string;
  telepon: string;
  hp: string;
  email: string;
  no_npwp: string;
  nama_npwp: string;
  alamat_npwp: string;
  tanggal_terdaftar_npwp: string;
  no_ktp: string;
  masa_berlaku_ktp: string;
  no_jamsotek: string;
  sim_1: string;
  sim_2: string;
  is_jpk_khusus: boolean;
}

interface DetailKeluarga {
  id_karyawan: string;
  id_biodata_karyawan: string;
  status_kawin: string;
  jumlah_tanggungan: number;
  nama_pasangan: string;
  tempat_lahir_pasangan: string;
  tanggal_lahir_pasangan: string;
  pendidikan_pasangan: string;
  pekerjaan_pasangan: string;
  nama_ayah: string;
  tempat_lahir_ayah: string;
  tanggal_lahir_ayah: string;
  pendidikan_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  tempat_lahir_ibu: string;
  tanggal_lahir_ibu: string;
  pendidikan_ibu: string;
  pekerjaan_ibu: string;
}

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

  // State for Detail Keluarga (original data from API)
  const [originalKeluargaData, setOriginalKeluargaData] = useState<any>(null);

  // State for Detail Informasi (form data)
  const [detailInformasi, setDetailInformasi] = useState<DetailInformasi>({
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

  // State for Detail Keluarga (form data)
  const [detailKeluarga, setDetailKeluarga] = useState<DetailKeluarga>({
    id_karyawan: '',
    id_biodata_karyawan: '',
    status_kawin: '',
    jumlah_tanggungan: 0,
    nama_pasangan: '',
    tempat_lahir_pasangan: '',
    tanggal_lahir_pasangan: '',
    pendidikan_pasangan: '',
    pekerjaan_pasangan: '',
    nama_ayah: '',
    tempat_lahir_ayah: '',
    tanggal_lahir_ayah: '',
    pendidikan_ayah: '',
    pekerjaan_ayah: '',
    nama_ibu: '',
    tempat_lahir_ibu: '',
    tanggal_lahir_ibu: '',
    pendidikan_ibu: '',
    pekerjaan_ibu: '',
  });
  const [originalPendidikanData, setOriginalPendidikanData] = useState<
    RiwayatPendidikan[] | null
  >(null);
  const [detailPendidikan, setDetailPendidikan] = useState<RiwayatPendidikan>({
    id_karyawan: '',
    id_biodata_karyawan: '',
    tingkat: '',
    nama_sekolah: '',
    kota: '',
    jurusan: '',
    tahun_lulus: '',
    berijazah: '',
  });
  const [editingPendidikanIndex, setEditingPendidikanIndex] = useState<
    number | null
  >(null);
  const [isAddingPendidikan, setIsAddingPendidikan] = useState(false);

  const [originalPekerjaanData, setOriginalPekerjaanData] = useState<
    RiwayatPekerjaan[] | null
  >(null);
  const [detailPekerjaan, setDetailPekerjaan] = useState<RiwayatPekerjaan>({
    id_karyawan: '',
    id_biodata_karyawan: '',
    dari_tahun: '',
    dari_bulan: '',
    sampai_tahun: '',
    sampai_bulan: '',
    nama_perusahaan: '',
    jabatan: '',
    keterangan: '',
  });
  const [editingPekerjaanIndex, setEditingPekerjaanIndex] = useState<
    number | null
  >(null);
  const [isAddingPekerjaan, setIsAddingPekerjaan] = useState(false);

  useEffect(() => {
    if (employeeId) {
      getKaryawan();
    }
  }, [employeeId]);

  useEffect(() => {
    fetchDetailInformasi();
    fetchDetailKeluarga();
    fetchDetailPendidikan();
    fetchDetailPekerjaan();
  }, [employeeId]);

  async function getKaryawan() {
    if (!employeeId) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${employeeId}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('karyawan', res.data);
      setbiodataKaryawan(res.data.data.biodata_karyawan[0].id);
    } catch (error: any) {
      console.error('Error fetching karyawan data:', error);
    }
  }
  const fetchDetailPekerjaan = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanRiwayatPekerjaan`;
    try {
      const response = await axios.get(url, {
        params: { id_karyawan: employeeId },
        withCredentials: true,
      });

      console.log('Response pekerjaan data:', response.data.data);

      if (
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const filteredData = response.data.data.filter((item: any) => {
          const itemIdKaryawan = item.id_karyawan;
          const paramEmployeeId = employeeId;

          return (
            Number(itemIdKaryawan) === Number(paramEmployeeId) ||
            String(itemIdKaryawan) === String(paramEmployeeId) ||
            itemIdKaryawan == paramEmployeeId
          );
        });

        setOriginalPekerjaanData(filteredData);
      } else {
        setOriginalPekerjaanData([]);
      }
    } catch (error) {
      console.error('Error fetching detail pekerjaan:', error);
      setOriginalPekerjaanData([]);
    } finally {
      setLoading(false);
    }
  };

  const resetDetailPekerjaan = () => {
    setDetailPekerjaan({
      id_karyawan: '',
      id_biodata_karyawan: '',
      dari_tahun: '',
      dari_bulan: '',
      sampai_tahun: '',
      sampai_bulan: '',
      nama_perusahaan: '',
      jabatan: '',
      keterangan: '',
    });
  };

  const saveDetailPekerjaan = async () => {
    setSaving(true);

    try {
      if (
        !detailPekerjaan.nama_perusahaan ||
        !detailPekerjaan.jabatan ||
        !detailPekerjaan.dari_bulan ||
        !detailPekerjaan.dari_tahun ||
        !detailPekerjaan.sampai_bulan ||
        !detailPekerjaan.sampai_tahun
      ) {
        alert('Nama perusahaan, jabatan, dan periode kerja harus diisi');
        setSaving(false);
        return;
      }

      let response;
      const payload = {
        ...detailPekerjaan,
        id_karyawan: employeeId,
        id_biodata_karyawan: biodataKaryawan,
      };

      if (editingPekerjaanIndex !== null && originalPekerjaanData) {
        // Update existing record
        const existingRecord = originalPekerjaanData[editingPekerjaanIndex];
        const updateUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanRiwayatPekerjaan/${existingRecord.id}`;
        response = await axios.put(updateUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data riwayat pekerjaan berhasil diperbarui');
      } else {
        // Create new record
        const createUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanRiwayatPekerjaan`;
        response = await axios.post(createUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data riwayat pekerjaan berhasil disimpan');
      }

      await fetchDetailPekerjaan();
      setIsEditing(false);
      setIsAddingPekerjaan(false);
      setEditingPekerjaanIndex(null);
      resetDetailPekerjaan();
    } catch (error: any) {
      console.error('Error saving detail pekerjaan:', error);

      if (error.response) {
        if (error.response.status === 400) {
          alert(
            `Gagal menyimpan data pekerjaan: ${
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
            `Gagal menyimpan data pekerjaan: ${
              error.response.data.message || 'Terjadi kesalahan tidak dikenal'
            }`,
          );
        }
      } else if (error.request) {
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteDetailPekerjaan = async (index: number) => {
    if (!originalPekerjaanData || !originalPekerjaanData[index]) return;

    const confirmDelete = window.confirm(
      'Apakah Anda yakin ingin menghapus data riwayat pekerjaan ini?',
    );
    if (!confirmDelete) return;

    setSaving(true);
    try {
      const recordToDelete = originalPekerjaanData[index];
      const deleteUrl = `${
        import.meta.env.VITE_API_LINK
      }/hr/karyawanRiwayatPekerjaan/${recordToDelete.id}`;

      await axios.delete(deleteUrl, {
        withCredentials: true,
      });

      alert('Data riwayat pekerjaan berhasil dihapus');
      await fetchDetailPekerjaan();
    } catch (error: any) {
      console.error('Error deleting detail pekerjaan:', error);
      alert('Gagal menghapus data riwayat pekerjaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDetailPekerjaanChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setDetailPekerjaan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditPekerjaan = (index: number) => {
    if (originalPekerjaanData && originalPekerjaanData[index]) {
      setDetailPekerjaan(originalPekerjaanData[index]);
      setEditingPekerjaanIndex(index);
      setIsEditing(true);
      setIsAddingPekerjaan(false);
    }
  };

  const handleAddPekerjaan = () => {
    resetDetailPekerjaan();
    setEditingPekerjaanIndex(null);
    setIsEditing(true);
    setIsAddingPekerjaan(true);
  };

  const handleCancelEditPekerjaan = () => {
    setIsEditing(false);
    setIsAddingPekerjaan(false);
    setEditingPekerjaanIndex(null);
    resetDetailPekerjaan();
  };

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
        const filteredData = response.data.data.filter((item: any) => {
          const itemIdKaryawan = item.id_karyawan;
          const paramEmployeeId = employeeId;

          return (
            Number(itemIdKaryawan) === Number(paramEmployeeId) ||
            String(itemIdKaryawan) === String(paramEmployeeId) ||
            itemIdKaryawan == paramEmployeeId
          );
        });

        if (filteredData.length > 0) {
          const latestRecord = filteredData.sort((a: any, b: any) => {
            if (a.updatedAt && b.updatedAt) {
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            }
            if (a.createdAt && b.createdAt) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            if (a.id && b.id) {
              return b.id - a.id;
            }
            return 0;
          })[0];

          setOriginalData(latestRecord);
          setDetailInformasi(latestRecord);
        } else {
          setOriginalData(null);
          resetDetailInformasi();
        }
      } else {
        setOriginalData(null);
        resetDetailInformasi();
      }
    } catch (error) {
      console.error('Error fetching detail informasi:', error);
      setOriginalData(null);
      alert('Gagal memuat data detail informasi atau data belum ada');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailKeluarga = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanDetailKeluarga`;
    try {
      const response = await axios.get(url, {
        params: { id_karyawan: employeeId },
        withCredentials: true,
      });

      console.log('Response keluarga data:', response.data.data);

      if (
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const filteredData = response.data.data.filter((item: any) => {
          const itemIdKaryawan = item.id_karyawan;
          const paramEmployeeId = employeeId;

          return (
            Number(itemIdKaryawan) === Number(paramEmployeeId) ||
            String(itemIdKaryawan) === String(paramEmployeeId) ||
            itemIdKaryawan == paramEmployeeId
          );
        });

        if (filteredData.length > 0) {
          const latestRecord = filteredData.sort((a: any, b: any) => {
            if (a.updatedAt && b.updatedAt) {
              return (
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
              );
            }
            if (a.createdAt && b.createdAt) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            if (a.id && b.id) {
              return b.id - a.id;
            }
            return 0;
          })[0];

          setOriginalKeluargaData(latestRecord);
          setDetailKeluarga(latestRecord);
        } else {
          setOriginalKeluargaData(null);
          resetDetailKeluarga();
        }
      } else {
        setOriginalKeluargaData(null);
        resetDetailKeluarga();
      }
    } catch (error) {
      console.error('Error fetching detail keluarga:', error);
      setOriginalKeluargaData(null);
      // Don't show alert for keluarga data as it's optional
    } finally {
      setLoading(false);
    }
  };

  const resetDetailInformasi = () => {
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
  };

  const resetDetailKeluarga = () => {
    setDetailKeluarga({
      id_karyawan: '',
      id_biodata_karyawan: '',
      status_kawin: '',
      jumlah_tanggungan: 0,
      nama_pasangan: '',
      tempat_lahir_pasangan: '',
      tanggal_lahir_pasangan: '',
      pendidikan_pasangan: '',
      pekerjaan_pasangan: '',
      nama_ayah: '',
      tempat_lahir_ayah: '',
      tanggal_lahir_ayah: '',
      pendidikan_ayah: '',
      pekerjaan_ayah: '',
      nama_ibu: '',
      tempat_lahir_ibu: '',
      tanggal_lahir_ibu: '',
      pendidikan_ibu: '',
      pekerjaan_ibu: '',
    });
  };

  const saveDetailInformasi = async () => {
    setSaving(true);

    try {
      let response;

      // Prepare payload with null for empty date fields
      const payload = {
        ...detailInformasi,
        tanggal_lahir: detailInformasi.tanggal_lahir || null,
        tanggal_terdaftar_npwp: detailInformasi.tanggal_terdaftar_npwp || null,
        masa_berlaku_ktp: detailInformasi.masa_berlaku_ktp || null,
      };

      if (originalData && originalData.id_karyawan) {
        const updateUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailInformasi/${originalData.id || employeeId}`;
        response = await axios.put(updateUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data berhasil diperbarui');
      } else {
        const createUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailInformasi`;
        const createPayload = {
          ...payload,
          id_karyawan: employeeId,
          id_biodata_karyawan: biodataKaryawan,
        };
        response = await axios.post(createUrl, createPayload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data berhasil disimpan');
      }

      await fetchDetailInformasi();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving detail informasi:', error);

      if (error.response) {
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
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveDetailKeluarga = async () => {
    setSaving(true);

    try {
      let response;

      // Prepare payload with null for empty date fields
      const payload = {
        ...detailKeluarga,
        tanggal_lahir_pasangan: detailKeluarga.tanggal_lahir_pasangan || null,
        tanggal_lahir_ayah: detailKeluarga.tanggal_lahir_ayah || null,
        tanggal_lahir_ibu: detailKeluarga.tanggal_lahir_ibu || null,
      };

      if (originalKeluargaData && originalKeluargaData.id_karyawan) {
        const updateUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailKeluarga/${originalKeluargaData.id || employeeId}`;
        response = await axios.put(updateUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data keluarga berhasil diperbarui');
      } else {
        const createUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanDetailKeluarga`;
        const createPayload = {
          ...payload,
          id_karyawan: employeeId,
          id_biodata_karyawan: biodataKaryawan,
        };
        response = await axios.post(createUrl, createPayload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data keluarga berhasil disimpan');
      }

      await fetchDetailKeluarga();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving detail keluarga:', error);

      if (error.response) {
        if (error.response.status === 400) {
          alert(
            `Gagal menyimpan data keluarga: ${
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
            `Gagal menyimpan data keluarga: ${
              error.response.data.message || 'Terjadi kesalahan tidak dikenal'
            }`,
          );
        }
      } else if (error.request) {
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDetailInformasiChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setDetailInformasi((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDetailKeluargaChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setDetailKeluarga((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Update the handleCancelEdit function to include pekerjaan case
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (activeTab === 'informasi') {
      if (originalData) {
        setDetailInformasi(originalData);
      }
    } else if (activeTab === 'keluarga') {
      if (originalKeluargaData) {
        setDetailKeluarga(originalKeluargaData);
      }
    } else if (activeTab === 'pendidikan') {
      handleCancelEditPendidikan();
    } else if (activeTab === 'pekerjaan') {
      handleCancelEditPekerjaan();
    }
  };
  const fetchDetailPendidikan = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanRiwayatPendidikan`;
    try {
      const response = await axios.get(url, {
        params: { id_karyawan: employeeId },
        withCredentials: true,
      });

      console.log('Response pendidikan data:', response.data.data);

      if (
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const filteredData = response.data.data.filter((item: any) => {
          const itemIdKaryawan = item.id_karyawan;
          const paramEmployeeId = employeeId;

          return (
            Number(itemIdKaryawan) === Number(paramEmployeeId) ||
            String(itemIdKaryawan) === String(paramEmployeeId) ||
            itemIdKaryawan == paramEmployeeId
          );
        });

        setOriginalPendidikanData(filteredData);
      } else {
        setOriginalPendidikanData([]);
      }
    } catch (error) {
      console.error('Error fetching detail pendidikan:', error);
      setOriginalPendidikanData([]);
    } finally {
      setLoading(false);
    }
  };

  const resetDetailPendidikan = () => {
    setDetailPendidikan({
      id_karyawan: '',
      id_biodata_karyawan: '',
      tingkat: '',
      nama_sekolah: '',
      kota: '',
      jurusan: '',
      tahun_lulus: '',
      berijazah: '',
    });
  };

  const saveDetailPendidikan = async () => {
    setSaving(true);

    try {
      if (
        !detailPendidikan.tingkat ||
        !detailPendidikan.nama_sekolah ||
        !detailPendidikan.berijazah
      ) {
        alert('Tingkat, nama sekolah, dan status berijazah harus diisi');
        setSaving(false);
        return;
      }

      let response;
      const payload = {
        ...detailPendidikan,
        id_karyawan: employeeId,
        id_biodata_karyawan: biodataKaryawan,
      };

      if (editingPendidikanIndex !== null && originalPendidikanData) {
        // Update existing record
        const existingRecord = originalPendidikanData[editingPendidikanIndex];
        const updateUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanRiwayatPendidikan/${existingRecord.id}`;
        response = await axios.put(updateUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data riwayat pendidikan berhasil diperbarui');
      } else {
        // Create new record
        const createUrl = `${
          import.meta.env.VITE_API_LINK
        }/hr/karyawanRiwayatPendidikan`;
        response = await axios.post(createUrl, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Data riwayat pendidikan berhasil disimpan');
      }

      await fetchDetailPendidikan();
      setIsEditing(false);
      setIsAddingPendidikan(false);
      setEditingPendidikanIndex(null);
      resetDetailPendidikan();
    } catch (error: any) {
      console.error('Error saving detail pendidikan:', error);

      if (error.response) {
        if (error.response.status === 400) {
          alert(
            `Gagal menyimpan data pendidikan: ${
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
            `Gagal menyimpan data pendidikan: ${
              error.response.data.message || 'Terjadi kesalahan tidak dikenal'
            }`,
          );
        }
      } else if (error.request) {
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteDetailPendidikan = async (index: number) => {
    if (!originalPendidikanData || !originalPendidikanData[index]) return;

    const confirmDelete = window.confirm(
      'Apakah Anda yakin ingin menghapus data riwayat pendidikan ini?',
    );
    if (!confirmDelete) return;

    setSaving(true);
    try {
      const recordToDelete = originalPendidikanData[index];
      const deleteUrl = `${
        import.meta.env.VITE_API_LINK
      }/hr/karyawanRiwayatPendidikan/${recordToDelete.id}`;

      await axios.delete(deleteUrl, {
        withCredentials: true,
      });

      alert('Data riwayat pendidikan berhasil dihapus');
      await fetchDetailPendidikan();
    } catch (error: any) {
      console.error('Error deleting detail pendidikan:', error);
      alert('Gagal menghapus data riwayat pendidikan');
    } finally {
      setSaving(false);
    }
  };

  const handleDetailPendidikanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDetailPendidikan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditPendidikan = (index: number) => {
    if (originalPendidikanData && originalPendidikanData[index]) {
      setDetailPendidikan(originalPendidikanData[index]);
      setEditingPendidikanIndex(index);
      setIsEditing(true);
      setIsAddingPendidikan(false);
    }
  };

  const handleAddPendidikan = () => {
    resetDetailPendidikan();
    setEditingPendidikanIndex(null);
    setIsEditing(true);
    setIsAddingPendidikan(true);
  };

  const handleCancelEditPendidikan = () => {
    setIsEditing(false);
    setIsAddingPendidikan(false);
    setEditingPendidikanIndex(null);
    resetDetailPendidikan();
  };

  const tabs = [
    { id: 'informasi', label: 'Detail Informasi', icon: '👤' },
    { id: 'keluarga', label: 'Detail Keluarga', icon: '👨‍👩‍👧‍👦' },
    { id: 'pendidikan', label: 'Riwayat Pendidikan', icon: '🎓' },
    { id: 'pekerjaan', label: 'Riwayat Pekerjaan', icon: '💼' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informasi':
        return isEditing ? (
          <DetailInformasiForm
            detailInformasi={detailInformasi}
            onChange={handleDetailInformasiChange}
            onSave={saveDetailInformasi}
            onCancel={handleCancelEdit}
            saving={saving}
            isUpdate={!!originalData}
          />
        ) : (
          <DetailInformasiDisplay
            originalData={originalData}
            onEdit={handleEdit}
            convertTimeStampToDateOnly={convertTimeStampToDateOnly}
          />
        );
      case 'keluarga':
        return isEditing ? (
          <DetailKeluargaForm
            detailKeluarga={detailKeluarga}
            onChange={handleDetailKeluargaChange}
            onSave={saveDetailKeluarga}
            onCancel={handleCancelEdit}
            saving={saving}
            isUpdate={!!originalKeluargaData}
          />
        ) : (
          <DetailKeluargaDisplay
            originalData={originalKeluargaData}
            onEdit={handleEdit}
            convertTimeStampToDateOnly={convertTimeStampToDateOnly}
          />
        );
      case 'pendidikan':
        return isEditing &&
          (isAddingPendidikan || editingPendidikanIndex !== null) ? (
          <DetailPendidikanForm
            detailPendidikan={detailPendidikan}
            onChange={handleDetailPendidikanChange}
            onSave={saveDetailPendidikan}
            onCancel={handleCancelEditPendidikan}
            saving={saving}
            isUpdate={editingPendidikanIndex !== null}
          />
        ) : (
          <DetailPendidikanDisplay
            originalData={originalPendidikanData}
            onEdit={handleEditPendidikan}
            onAdd={handleAddPendidikan}
            onDelete={deleteDetailPendidikan}
          />
        );
      case 'pekerjaan':
        return isEditing &&
          (isAddingPekerjaan || editingPekerjaanIndex !== null) ? (
          <DetailPekerjaanForm
            detailPekerjaan={detailPekerjaan}
            onChange={handleDetailPekerjaanChange}
            onSave={saveDetailPekerjaan}
            onCancel={handleCancelEditPekerjaan}
            saving={saving}
            isUpdate={editingPekerjaanIndex !== null}
          />
        ) : (
          <DetailPekerjaanDisplay
            originalData={originalPekerjaanData}
            onEdit={handleEditPekerjaan}
            onAdd={handleAddPekerjaan}
            onDelete={deleteDetailPekerjaan}
          />
        );
      default:
        return isEditing ? (
          <DetailInformasiForm
            detailInformasi={detailInformasi}
            onChange={handleDetailInformasiChange}
            onSave={saveDetailInformasi}
            onCancel={handleCancelEdit}
            saving={saving}
            isUpdate={!!originalData}
          />
        ) : (
          <DetailInformasiDisplay
            originalData={originalData}
            onEdit={handleEdit}
            convertTimeStampToDateOnly={convertTimeStampToDateOnly}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className=" mx-auto">
        {/* Header */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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

        {/* Content */}
        {loading ? <Loading /> : renderTabContent()}
      </div>
    </div>
  );
}

export default LengkapiMasterKaryawanIsi;
