import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import ModalAddPeriode from '../../../Modals/Qc/ModalAddPeriode';
import LengkapiMasterKaryawanIsi from './LengkapiMasterKaryawanIsi';

function EditMasterKaryawanIsi() {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();

  // Image states
  const [fotoKaryawan, setFotoKaryawan] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  useEffect(() => {
    getDepartment();
    getBagian();
    getDivisi();
    getGradeMaster();
    getkaryawanStatus();
    getjabatanMaster();
    getMasterMesin();
    getKaryawan();
  }, []);

  useEffect(() => {
    // Clean up preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Helper function to convert timestamp to yyyy-mm-dd for input value
  const convertTimeStampToDate2 = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format date for display (d / MonthName / yyyy)
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '-';

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} / ${month} / ${year}`;
  };

  const [karyawan, setKaryawan] = useState<any>(null);
  const [bagianMesin, setBagianMesin] = useState([
    {
      id: null,
      id_bagian_mesin: null,
      nama_bagian_mesin: '',
    },
  ]);

  async function getKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('karyawan', res.data.data);
      setjenisKelamin(res.data.data.biodata_karyawan[0]?.jenis_kelamin);
      seTipeKaryawan(res.data.data.biodata_karyawan[0]?.tipe_karyawan);
      seidDivisi(res.data.data.biodata_karyawan[0]?.divisi?.id);
      setidDepartment(res.data.data.biodata_karyawan[0]?.department?.id);
      setgrade(res.data.data.biodata_karyawan[0]?.grade?.id);
      sejabatan(res.data.data.biodata_karyawan[0]?.jabatan?.id);
      setIdStatusKaryawan(res.data.data.biodata_karyawan[0]?.status?.id);

      // Store dates in yyyy-mm-dd format for payload
      setglMasuk(
        res.data.data.biodata_karyawan[0]?.tgl_masuk == null
          ? null
          : convertTimeStampToDate2(
              res.data.data.biodata_karyawan[0]?.tgl_masuk,
            ),
      );
      setglKeluar(
        res.data.data.biodata_karyawan[0]?.tgl_keluar == null
          ? null
          : convertTimeStampToDate2(
              res.data.data.biodata_karyawan[0]?.tgl_keluar,
            ),
      );

      sestatusPajak(res.data.data.biodata_karyawan[0]?.status_pajak);
      settipePenggajian(res.data.data.biodata_karyawan[0]?.tipe_penggajian);
      setBagianMesin(
        res.data.data.biodata_karyawan[0]?.bagian_mesin_karyawan?.map(
          (item: any) => ({
            id: item.id,
            id_bagian_mesin: null,
            nama_bagian_mesin: item.nama_bagian_mesin,
          }),
        ),
      );
      setGaji(res.data.data.biodata_karyawan[0]?.gaji);

      // Set existing photo if available
      if (res.data.data.biodata_karyawan[0]?.foto_karyawan) {
        const existingPhotoUrl = `${import.meta.env.VITE_API_LINK}/images/${
          res.data.data.biodata_karyawan[0].foto_karyawan
        }`;
        setPreviewUrl(existingPhotoUrl);
      }

      setKaryawan(res.data.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [namaBagianMesin, setNamaBagianMesin] = useState<any>();

  async function tambahBagian() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanBagianMesin`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_biodata_karyawan: karyawan?.biodata_karyawan[0]?.id,
          id_karyawan: id,
          id_bagian_mesin: null,
          nama_bagian_mesin: namaBagianMesin,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      closeModal1();
      getKaryawan();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function deleteBagian(id: number) {
    if (
      window.confirm('Apakah Anda yakin ingin Menghapus Bagian Karyawan ini?')
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/karyawanBagianMesin/${id}`;
      try {
        setIsLoading(true);
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        setIsLoading(false);
        alert('Data Berhasil Dihapus');
        getKaryawan();
        console.log(res.data);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  const [department, setDepartment] = useState<any>();

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setDepartment(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      const res = await axios.get(url, {});
      setMesinMaster(res.data.data);
      console.log('mesin list', res.data.data);
      setOptions(
        res.data.data.map((item: any) => ({
          value: item.nama_mesin,
          label: item.nama_mesin,
        })),
      );
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [jabatanMaster, setjabatanMaster] = useState<any>();

  async function getjabatanMaster() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/jabatan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setjabatanMaster(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [karyawanStatus, setkaryawanStatus] = useState<any>();

  async function getkaryawanStatus() {
    const url = `${import.meta.env.VITE_API_LINK}/master/statusKaryawan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setkaryawanStatus(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [divisi, setDivisi] = useState<any>();

  async function getDivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: { is_active: true },
        withCredentials: true,
      });
      setIsLoading(false);
      setDivisi(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [bagian, setBagian] = useState<any>();
  const [mesinMaster, setMesinMaster] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const handleAddPoint = () => {
    setBagianMesin([
      ...bagianMesin,
      {
        id: null,
        id_bagian_mesin: null,
        nama_bagian_mesin: '',
      },
    ]);
  };

  async function getBagian() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/bagian`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setBagian(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [gradeMaster, setGradeMaster] = useState<any>();

  async function getGradeMaster() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setGradeMaster(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [namaKaryawan, setnamaKaryawan] = useState<any>();
  const [nik, setnik] = useState<any>();
  const [jenisKelamin, setjenisKelamin] = useState<any>();
  const [idDivisi, seidDivisi] = useState<any>();
  const [idDepartment, setidDepartment] = useState<any>();
  const [idStatusKaryawan, setIdStatusKaryawan] = useState<any>();
  const [idDagian, setidDagian] = useState<any>();
  const [grade, setgrade] = useState<any>();
  const [tglMasuk, setglMasuk] = useState<any>(null);
  const [tglKeluar, setglKeluar] = useState<any>(null);
  const [tipePenggajian, settipePenggajian] = useState<any>();
  const [jabatan, sejabatan] = useState<any>();
  const [statusPajak, sestatusPajak] = useState<any>();
  const [level, setlevel] = useState<any>();
  const [subLevel, setsubLevel] = useState<any>();
  const [gaji, setGaji] = useState<any>(0);
  const [tipeKaryawan, seTipeKaryawan] = useState<any>();

  // Image handling functions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 1 MB');
      return;
    }

    // Clean up previous preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    setFotoKaryawan(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFotoKaryawan(null);
    setPreviewUrl(null);

    const fileInput = document.getElementById(
      'foto-upload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage('');
  };

  async function handleFileUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return (
        response.data.fileName || response.data.filename || response.data.file
      );
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error('Gagal mengupload file');
    }
  }

  async function tambahKaryawan(iid: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${iid}`;
    try {
      setIsLoading(true);

      // Upload foto if new file is selected
      let fotoFileName = karyawan?.biodata_karyawan[0]?.foto_karyawan || null;
      if (fotoKaryawan) {
        fotoFileName = await handleFileUpload(fotoKaryawan);
      }

      // Payload uses yyyy-mm-dd format (ISO format)
      const res = await axios.put(
        url,
        {
          id_status_karyawan: idStatusKaryawan,
          nama_karyawan: namaKaryawan,
          tipe_karyawan: tipeKaryawan,
          nik: nik,
          jenis_kelamin: jenisKelamin,
          id_divisi: idDivisi,
          id_department: idDepartment,
          bagian_mesin: bagianMesin,
          id_grade: grade,
          tgl_masuk: tglMasuk, // Already in yyyy-mm-dd format
          tgl_keluar: tglKeluar, // Already in yyyy-mm-dd format
          tipe_penggajian: tipePenggajian,
          id_jabatan: jabatan,
          status_pajak: statusPajak,
          level: level,
          sub_level: subLevel,
          gaji: gaji,
          foto_karyawan: fotoFileName,
          kontrak_dari: null,
          kontrak_sampai: null,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      alert('Data berhasil disimpan!');
      window.location.reload();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  }

  const recalculateWaktuKeluar = (
    masukDate: string,
    waktuBulan: number,
    type: string | null,
  ) => {
    if (!masukDate || !waktuBulan) return null;
    const date = new Date(masukDate);

    if (type === 'hari') {
      date.setDate(date.getDate() + waktuBulan);
    } else {
      date.setMonth(date.getMonth() + waktuBulan);
    }

    // Return in yyyy-mm-dd format
    return date.toISOString().split('T')[0];
  };

  const handleStatusChange = (e: any) => {
    const selectedId = e.target.value;
    setIdStatusKaryawan(selectedId);

    const selectedStatus = karyawanStatus.data.find(
      (data: any) => data.id === parseInt(selectedId),
    );
    if (selectedStatus) {
      const defaultTglMasuk =
        tglMasuk || new Date().toISOString().split('T')[0];
      const recalculatedKeluar = recalculateWaktuKeluar(
        defaultTglMasuk,
        selectedStatus.waktu_bulan,
        selectedStatus.type,
      );
      setglKeluar(recalculatedKeluar);
    }
  };

  const handleTglMasukChange = (e: any) => {
    const inputDate = e.target.value;
    setglMasuk(inputDate); // Store in yyyy-mm-dd format

    const selectedStatus = karyawanStatus.data.find(
      (data: any) => data.id === parseInt(idStatusKaryawan),
    );
    if (selectedStatus) {
      const recalculatedKeluar = recalculateWaktuKeluar(
        inputDate,
        selectedStatus.waktu_bulan,
        selectedStatus.type,
      );
      setglKeluar(recalculatedKeluar);
    }
  };

  const handleChangePointDepartment = (selected: any, index: number) => {
    const updatedBagianMesin = [...bagianMesin];
    const { value } = selected;

    updatedBagianMesin[index] = {
      ...updatedBagianMesin[index],
      nama_bagian_mesin: value,
    };

    console.log(updatedBagianMesin);
    setBagianMesin(updatedBagianMesin);
  };

  const [showModal1, setShowModal1] = useState(false);
  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = mesinMaster.find((item: any) => item.mesin == value);
    setNamaBagianMesin(filteredData?.mesin);
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto"
          onClick={closeFullscreen}
        >
          <div className="relative w-full min-h-screen flex justify-center p-4">
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="max-w-full h-auto block"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors text-xl font-bold"
              onClick={closeFullscreen}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="min-w-[700px] bg-white rounded-t-md border-b-8 border-[#D8EAFF] h-12"></div>
      <div className="min-w-[700px] bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex w-full bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-4 rounded-t-lg">
          <label className="text-[#0065de] text-lg font-bold tracking-wide">
            BIODATA KARYAWAN
          </label>
        </div>

        <div className="w-full bg-white px-8 py-8 grid grid-cols-2 gap-8 rounded-b-lg">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Photo Upload Section */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto Karyawan
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : fotoKaryawan || previewUrl
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="foto-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openFullscreen(previewUrl)}
                      />
                    </div>
                    {fotoKaryawan && (
                      <p className="text-sm font-medium text-gray-900">
                        {fotoKaryawan.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Klik gambar untuk memperbesar
                    </p>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Hapus foto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        Klik untuk upload
                      </span>{' '}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG hingga 1MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* NIK and Gender Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-8">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIK
                  </label>
                  <input
                    defaultValue={karyawan?.biodata_karyawan[0]?.nik}
                    onChange={(e) => setnik(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        onChange={(e) => setjenisKelamin(e.target.value)}
                        type="radio"
                        name="kelamin"
                        value="Laki-Laki"
                        checked={jenisKelamin === 'Laki-Laki'}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Laki-Laki</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        onChange={(e) => setjenisKelamin(e.target.value)}
                        type="radio"
                        name="kelamin"
                        value="Perempuan"
                        checked={jenisKelamin === 'Perempuan'}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Perempuan</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Karyawan
                </label>
                <input
                  defaultValue={karyawan?.name}
                  onChange={(e) => setnamaKaryawan(e.target.value)}
                  type="text"
                  className="w-3/5 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Karyawan
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      onChange={(e) => seTipeKaryawan(e.target.value)}
                      type="radio"
                      name="tipeKryawan"
                      value="produksi"
                      checked={tipeKaryawan === 'produksi'}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Produksi</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      onChange={(e) => seTipeKaryawan(e.target.value)}
                      type="radio"
                      name="tipeKryawan"
                      value="staff"
                      checked={tipeKaryawan === 'staff'}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Staff</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Department Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={idDepartment}
                    name="nama_department"
                    onChange={(e) => setidDepartment(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option selected disabled className="text-gray-500">
                      Pilih Department
                    </option>
                    {department?.data?.map((data: any, i: any) => (
                      <option key={i} value={data.id} className="text-gray-800">
                        {data.nama_department}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Divisi
                  </label>
                  <div className="relative">
                    <select
                      value={idDivisi}
                      name="nama_divisi"
                      onChange={(e) => seidDivisi(e.target.value)}
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                    >
                      <option selected disabled className="text-gray-500">
                        Pilih Divisi
                      </option>
                      {divisi?.data?.map((data: any, i: any) => (
                        <option
                          key={i}
                          value={data.id}
                          className="text-gray-800"
                        >
                          {data.nama_divisi}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jabatan
                  </label>
                  <div className="relative">
                    <select
                      value={jabatan}
                      onChange={(e) => sejabatan(e.target.value)}
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                    >
                      <option selected disabled className="text-gray-500">
                        Pilih Jabatan
                      </option>
                      {jabatanMaster?.data?.map((data: any, i: any) => (
                        <option
                          key={i}
                          value={data.id}
                          className="text-gray-800"
                        >
                          {data.nama_jabatan}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade
                </label>
                <div className="relative">
                  <select
                    value={grade}
                    name="grade"
                    onChange={(e) => setgrade(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option selected disabled className="text-gray-500">
                      Pilih Grade
                    </option>
                    {gradeMaster?.data?.map((data: any, i: any) => (
                      <option key={i} value={data.id} className="text-gray-800">
                        {data.kategori}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Masuk
                </label>
                <input
                  value={tglMasuk}
                  onChange={handleTglMasukChange}
                  type="date"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Karyawan
                </label>
                <div className="relative">
                  <select
                    value={idStatusKaryawan}
                    name="nama_department"
                    onChange={handleStatusChange}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option selected disabled className="text-gray-500">
                      Pilih Status Karyawan
                    </option>
                    {karyawanStatus?.data?.map((data: any, i: any) => (
                      <option key={i} value={data.id} className="text-gray-800">
                        {data.nama_status === 'tetap' ||
                        data.nama_status === 'keluar'
                          ? data.nama_status
                          : `${data.nama_status} - ${data.waktu_bulan} - ${
                              data.type === null ? 'Bulan' : data.type
                            }`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Keluar
                </label>
                {/* Display formatted date but keep internal value in yyyy-mm-dd */}
                <div className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700">
                  {formatDateForDisplay(tglKeluar)}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Pajak
                </label>
                <div className="relative">
                  <select
                    value={statusPajak}
                    onChange={(e) => sestatusPajak(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option selected disabled className="text-gray-500">
                      Pilih Status Pajak
                    </option>
                    {[
                      'TK0',
                      'TK1',
                      'TK2',
                      'TK3',
                      'K0',
                      'K1',
                      'K2',
                      'K3',
                      'KI0',
                      'KI1',
                      'KI2',
                      'KI3',
                    ].map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="text-gray-800"
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Penggajian
                </label>
                <div className="relative">
                  <select
                    value={tipePenggajian}
                    onChange={(e) => settipePenggajian(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option selected disabled className="text-gray-500">
                      Pilih Tipe Penggajian
                    </option>
                    <option value="mingguan" className="text-gray-800">
                      Mingguan
                    </option>
                    <option value="bulanan" className="text-gray-800">
                      Bulanan
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gaji
                </label>
                <input
                  value={gaji}
                  onChange={(e) => setGaji(e.target.value)}
                  type="number"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Masukkan gaji"
                />
              </div>
            </div>

            {/* Bagian Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bagian
                </label>
                <div className="space-y-3">
                  {bagianMesin?.map((item: any, index: any) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select
                          options={options}
                          onChange={(selected) =>
                            handleChangePointDepartment(selected, index)
                          }
                          value={
                            item.nama_bagian_mesin
                              ? options.find(
                                  (option) =>
                                    option.value === item.nama_bagian_mesin,
                                )
                              : null
                          }
                          placeholder="Pilih Bagian Mesin"
                          className="w-full"
                        />
                      </div>
                      <button
                        type="button"
                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        onClick={() => deleteBagian(item.id)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={openModal1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    Tambah Bagian
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level
                  </label>
                  <input
                    defaultValue={karyawan?.biodata_karyawan[0]?.level}
                    onChange={(e) => setlevel(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Masukkan level"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-Level
                  </label>
                  <input
                    defaultValue={karyawan?.biodata_karyawan[0]?.sub_level}
                    onChange={(e) => setsubLevel(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Masukkan sub-level"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal1 && (
          <ModalAddPeriode
            isOpen={showModal1}
            onClose={closeModal1}
            judul="TAMBAH BAGIAN MESIN"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Bagian Mesin
                </label>
                <Select
                  options={options}
                  onChange={(selected) => handleChangePointDepatment(selected)}
                  placeholder="Pilih Bagian Mesin"
                  className="w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => tambahBagian()}
                className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Tambah Bagian
              </button>
            </div>
          </ModalAddPeriode>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={() => {
              tambahKaryawan(karyawan?.userid);
              console.log('Tanggal Keluar (payload format):', tglKeluar);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            SIMPAN DATA
          </button>
        </div>
      </div>
      <LengkapiMasterKaryawanIsi />
    </main>
  );
}

export default EditMasterKaryawanIsi;
