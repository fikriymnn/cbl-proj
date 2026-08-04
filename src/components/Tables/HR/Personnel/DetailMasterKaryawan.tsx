import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Loading from '../../../Loading';
import DetailTabMasterKaryawan from './DetailTabMasterKaryawan';
import LengkapiMasterKaryawanIsi from './LengkapiMasterKaryawanIsi';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

// Helper function to calculate work duration
function calculateMasaKerja(tanggalMasuk: string): string {
  if (!tanggalMasuk) return '-';

  const startDate = new Date(tanggalMasuk);
  const today = new Date();

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  let days = today.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0) parts.push(`${days} hari`);

  return parts.length > 0 ? parts.join(' ') : '0 hari';
}

const topTabs = [
  { id: 'informasi', label: 'Informasi', icon: '👤' },
  { id: 'presensi', label: 'Presensi', icon: '🕐' },
  { id: 'karir', label: 'Karir', icon: '📈' },
  { id: 'upah', label: 'Upah', icon: '💰' },
  { id: 'pinjaman', label: 'Pinjaman', icon: '🏦' },
];

export default function DetailMasterKaryawanIsi() {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('informasi');
  const [isLoading, setIsLoading] = useState(false);
  const [karyawan, setKaryawan] = useState<any>(null);
  const [absen, setAbsen] = useState<any>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return '';

    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  useEffect(() => {
    if (id) {
      getKaryawan();
    }
  }, [id]);

  async function getKaryawan() {
    if (!id) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });

      let startDate = today;
      if (res.data?.data?.biodata_karyawan?.[0]?.tgl_masuk) {
        startDate = formatDateForAPI(
          res.data.data.biodata_karyawan[0].tgl_masuk,
        );
      }

      setKaryawan(res.data);

      await getAbsen(startDate);

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching karyawan data:', error);
    }
  }

  async function getAbsen(startDate: string) {
    if (!id || !startDate) return;

    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanPresensi`;
    try {
      const res = await axios.get(url, {
        params: {
          id_karyawan: id,
          start_date: startDate,
          end_date: today,
        },
        withCredentials: true,
      });
      setAbsen(res.data);
    } catch (error: any) {
      console.error('Error fetching absen data:', error);
    }
  }

  const [potongan, setPotongan] = useState<any>();
  const [namaPotongan, setNamaPotongan] = useState<any>();

  async function postPotongan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanPotongan`;
    try {
      setIsLoading(true);
      await axios.post(
        url,
        {
          id_biodata_karyawan: karyawan?.data?.biodata_karyawan[0]?.id,
          jumlah_potongan: potongan,
          nama_potongan: namaPotongan,
        },
        {
          withCredentials: true,
        },
      );

      getKaryawan();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function deletePotongan(idPot: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Potongan Ini?')) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/hr/karyawanPotongan/${idPot}`;
      try {
        setIsLoading(true);
        await axios.delete(url, {
          withCredentials: true,
        });

        getKaryawan();
        setIsLoading(false);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => setShowHistory(true);
  const closeModalHistory = () => setShowHistory(false);

  // Karir data derived from promosi_karyawan, split by type
  const promosiKaryawan = karyawan?.data?.promosi_karyawan || [];
  const promosiOnly = promosiKaryawan.filter(
    (item: any) => item.type === 'promosi',
  );
  const demosiOnly = promosiKaryawan.filter(
    (item: any) => item.type === 'demosi',
  );
  const mutasiOnly = promosiKaryawan.filter(
    (item: any) => item.type === 'mutasi',
  );

  // Pinjaman data
  const pinjamanKaryawan = karyawan?.data?.pinjaman_karyawan || [];
  const totalSisaPinjaman = pinjamanKaryawan.reduce(
    (sum: number, item: any) => sum + (item.sisa_pinjaman || 0),
    0,
  );

  const renderKarirSection = (title: string, data: any[]) => (
    <div className="border-b-8 border-[#D8EAFF]">
      <div className="bg-[#eeeeee] px-6 py-2">
        <label className="text-blue-400 text-sm font-normal">{title}</label>
      </div>
      <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
        <label className="text-black text-sm font-semibold">NO</label>
        <label className="text-black text-sm font-semibold col-span-3">
          PERIODE
        </label>
        <label className="text-black text-sm font-semibold col-span-2">
          DEPARTEMEN ASAL
        </label>
        <label className="text-black text-sm font-semibold col-span-2">
          JABATAN ASAL
        </label>
        <label className="text-black text-sm font-semibold col-span-3">
          ALASAN
        </label>
        <label className="text-black text-sm font-semibold col-span-1">
          STATUS
        </label>
      </div>
      {data.length > 0 ? (
        data.map((item: any, i: number) => (
          <div key={item.id ?? i} className="grid grid-cols-12 gap-1 px-6 py-2">
            <label className="text-stone-500 text-sm font-semibold">
              {i + 1}
            </label>
            <label className="text-stone-500 text-sm font-semibold col-span-3">
              {convertTimeStampToDate(item.tanggal_from)} s/d{' '}
              {convertTimeStampToDate(item.tanggal_to)}
            </label>
            <label className="text-stone-500 text-sm font-semibold col-span-2">
              {item.department_awal || '-'}
            </label>
            <label className="text-red-300 text-sm font-semibold col-span-2">
              {item.jabatan_awal || '-'}
            </label>
            <label className="text-stone-500 text-sm font-semibold col-span-3">
              {item.alasan_promosi || '-'}
            </label>
            <label className="text-blue-300 text-sm font-semibold col-span-1 capitalize">
              {item.status || '-'}
            </label>
          </div>
        ))
      ) : (
        <div className="px-6 py-4 text-center text-gray-500 text-sm">
          Tidak ada data {title.toLowerCase()}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informasi':
        return (
          <DetailTabMasterKaryawan>
            <>
              <div className="bg-[#eeeeee] px-6 py-2">
                <label className="text-blue-400 text-sm font-normal">
                  BIODATA
                </label>
              </div>
              <div className="grid grid-cols-2 px-6 py-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      NIK
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.nik}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Nama Karyawan
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.name}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Gender
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.jenis_kelamin}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Departemen
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {
                        karyawan?.data?.biodata_karyawan[0]?.department
                          ?.nama_department
                      }
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Divisi
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.divisi?.nama_divisi}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Bagian
                    </label>
                    {karyawan?.data?.biodata_karyawan[0]?.bagian_mesin_karyawan?.map(
                      (dataBagian: any, i: any) => (
                        <label
                          key={i}
                          className="text-[#636363] text-xl font-normal"
                        >
                          - {dataBagian.nama_bagian_mesin}
                        </label>
                      ),
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Jabatan
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {
                        karyawan?.data?.biodata_karyawan[0]?.jabatan
                          ?.nama_jabatan
                      }
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Tanggal Masuk
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {convertTimeStampToDateOnly(
                        karyawan?.data?.biodata_karyawan[0]?.tgl_masuk,
                      )}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Tanggal Keluar
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.tgl_keluar == null
                        ? '-'
                        : convertTimeStampToDateOnly(
                            karyawan?.data?.biodata_karyawan[0]?.tgl_keluar,
                          )}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Masa Kerja
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {calculateMasaKerja(
                        karyawan?.data?.biodata_karyawan[0]?.tgl_masuk,
                      )}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Status Karyawan
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.status?.nama_status}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Tipe Penggajian
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.tipe_penggajian}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Status Pajak
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.status_pajak}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      Grade
                    </label>
                    <label className="text-[#636363] text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.grade?.kategori ==
                      null
                        ? '-'
                        : karyawan?.data?.biodata_karyawan[0]?.grade?.kategori}
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-[#eeeeee] px-6 py-2">
                <label className="text-blue-400 text-sm font-normal">
                  SP AKTIF
                </label>
              </div>
              <div className="px-6 py-3">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        SP Ke
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Dari
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Sampai
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Alasan SP
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Teguran
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {karyawan?.sp_aktif?.map((sp: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">
                          {sp.sp_ke}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {convertTimeStampToDate(sp.dari)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {convertTimeStampToDate(sp.sampai)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {sp.alasan_sp}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {sp.teguran}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          </DetailTabMasterKaryawan>
        );

      case 'presensi':
        return (
          <DetailTabMasterKaryawan>
            <div className="flex flex-col w-full">
              <div className="bg-gray-200 px-6 py-2">
                <label className="text-blue-400 text-sm font-normal">
                  OVERVIEW
                </label>
              </div>
              <div className="grid grid-cols-2 px-6 py-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      IZIN
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.izin_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI IZIN
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.izin_hari || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      SAKIT
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.sakit_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI SAKIT
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.sakit_hari || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      MANGKIR
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.mangkir_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI MANGKIR
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.mangkir_hari || '-'}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      CUTI TAHUNAN
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.cuti_tahunan_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI CUTI TAHUNAN
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.cuti_tahunan_hari || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      CUTI KHUSUS
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.cuti_khusus_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI CUTI KHUSUS
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.cuti_khusus_hari || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      DINAS
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.dinas_tiket || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      HARI DINAS
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {absen?.dinas_hari || '-'}
                    </label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-black text-sm font-semibold">
                      SISA CUTI TAHUN INI
                    </label>
                    <label className="text-gray-600 text-xl font-normal">
                      {karyawan?.data?.biodata_karyawan[0]?.sisa_cuti <= 0
                        ? 'Tidak ada cuti'
                        : karyawan?.data?.biodata_karyawan[0]?.sisa_cuti}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </DetailTabMasterKaryawan>
        );

      case 'karir':
        return (
          <DetailTabMasterKaryawan>
            <>
              {renderKarirSection('PROMOSI', promosiOnly)}
              {renderKarirSection('DEMOSI', demosiOnly)}
              {renderKarirSection('MUTASI', mutasiOnly)}
            </>
          </DetailTabMasterKaryawan>
        );

      case 'upah':
        return (
          <DetailTabMasterKaryawan>
            <>
              <div className="border-b-8 border-[#D8EAFF]">
                <div className="bg-[#eeeeee] px-6 py-2">
                  <label className="text-blue-400 text-sm font-normal">
                    UPAH SAAT INI
                  </label>
                </div>
                <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
                  <label className="text-[#636363] text-xl">
                    Rp.{' '}
                    {karyawan?.data?.biodata_karyawan[0]?.gaji == null ||
                    karyawan?.data?.biodata_karyawan[0]?.gaji == 0
                      ? '-'
                      : formatInteger(
                          karyawan?.data?.biodata_karyawan[0]?.gaji,
                        )}
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-4 py-1 w-full">
                <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
                  <label className="text-black text-sm font-semibold col-span-4">
                    Nama Potongan
                  </label>
                  <label className="text-black text-sm font-semibold col-span-3">
                    Jumlah Potongan
                  </label>
                </div>
                {karyawan?.data?.biodata_karyawan[0]?.potongan_karyawan?.map(
                  (data: any, i: any) => (
                    <div key={i} className="grid grid-cols-12 gap-1 px-6 py-2">
                      <label className="text-stone-500 text-sm font-semibold col-span-4">
                        {data.nama_potongan}
                      </label>
                      <label className="text-stone-500 text-sm font-semibold col-span-3">
                        {data.jumlah_potongan
                          ? formatInteger(data.jumlah_potongan)
                          : 0}
                      </label>
                      <button
                        onClick={() => deletePotongan(data.id)}
                        className="px-2 py-1 text-xs bg-red-400 items-center justify-center text-white font-semibold rounded-md flex w-full"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                )}
                <button
                  onClick={() => openModalHistory()}
                  className="bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2"
                >
                  TAMBAH POTONGAN
                </button>
                {showHistory && (
                  <ModalKosonganSmall
                    isOpen={showHistory}
                    onClose={() => closeModalHistory()}
                    judul={'Tambah Potongan'}
                  >
                    <div className="flex flex-col gap-1 w-full px-[1%] py-[1%]">
                      <div className="flex flex-col w-full">
                        <label className="text-black text-sm font-semibold">
                          Nama Potongan
                        </label>
                        <input
                          onChange={(e) => setNamaPotongan(e.target.value)}
                          type="text"
                          className="border-stroke border-2 rounded-md w-full"
                        />
                      </div>
                      <div className="flex flex-col w-full">
                        <label className="text-black text-sm font-semibold">
                          Total Potongan
                        </label>
                        <input
                          onChange={(e) => setPotongan(e.target.value)}
                          type="number"
                          className="border-stroke border-2 rounded-md w-full"
                        />
                      </div>
                      <button
                        onClick={() => postPotongan()}
                        className="bg-blue-500 px-2 text-white font-semibold rounded-md text-md"
                      >
                        Simpan
                      </button>
                    </div>
                  </ModalKosonganSmall>
                )}
              </div>
              <div>
                <div className="bg-[#eeeeee] px-6 py-2">
                  <label className="text-blue-400 text-sm font-normal">
                    RIWAYAT
                  </label>
                </div>
                <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
                  <label className="text-black text-sm font-semibold">NO</label>
                  <label className="text-black text-sm font-semibold col-span-3">
                    TANGGAL
                  </label>
                  <label className="text-black text-sm font-semibold col-span-4">
                    GAJI AWAL
                  </label>
                  <label className="text-black text-sm font-semibold col-span-4">
                    GAJI BARU
                  </label>
                </div>
                {promosiKaryawan.length > 0 ? (
                  promosiKaryawan.map((item: any, i: number) => (
                    <div
                      key={item.id ?? i}
                      className="grid grid-cols-12 gap-1 px-6 py-2"
                    >
                      <label className="text-stone-500 text-sm font-semibold">
                        {i + 1}
                      </label>
                      <label className="text-stone-500 text-sm font-semibold col-span-3">
                        {convertTimeStampToDate(item.tanggal_from)}
                      </label>
                      <label className="text-blue-300 text-sm font-semibold col-span-4">
                        {item.gaji_awal
                          ? `Rp. ${formatInteger(item.gaji_awal)}`
                          : '-'}
                      </label>
                      <label className="text-blue-300 text-sm font-semibold col-span-4">
                        {item.gaji_promosi
                          ? `Rp. ${formatInteger(item.gaji_promosi)}`
                          : '-'}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500 text-sm">
                    Belum ada riwayat gaji
                  </div>
                )}
              </div>
            </>
          </DetailTabMasterKaryawan>
        );

      case 'pinjaman':
        return (
          <DetailTabMasterKaryawan>
            <>
              <div className="border-b-8 border-[#D8EAFF]">
                <div className="bg-[#eeeeee] px-6 py-2">
                  <label className="text-blue-400 text-sm font-normal">
                    SISA PINJAMAN
                  </label>
                </div>
                <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
                  <label className="text-[#636363] text-xl">
                    Rp.{' '}
                    {totalSisaPinjaman > 0
                      ? formatInteger(totalSisaPinjaman)
                      : '-'}
                  </label>
                </div>
              </div>
              <div>
                <div className="bg-[#eeeeee] px-6 py-2">
                  <label className="text-blue-400 text-sm font-normal">
                    RIWAYAT PINJAMAN
                  </label>
                </div>
                <div className="grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]">
                  <label className="text-black text-sm font-semibold">NO</label>
                  <label className="text-black text-sm font-semibold col-span-2">
                    TANGGAL
                  </label>
                  <label className="text-black text-sm font-semibold col-span-2">
                    JUMLAH
                  </label>
                  <label className="text-black text-sm font-semibold col-span-2">
                    CICILAN
                  </label>
                  <label className="text-black text-sm font-semibold col-span-2">
                    SISA
                  </label>
                  <label className="text-black text-sm font-semibold col-span-3">
                    STATUS
                  </label>
                </div>
                {pinjamanKaryawan.length > 0 ? (
                  pinjamanKaryawan.map((item: any, i: number) => (
                    <div
                      key={item.id ?? i}
                      className="grid grid-cols-12 gap-1 px-6 py-2"
                    >
                      <label className="text-stone-500 text-sm font-semibold">
                        {i + 1}
                      </label>
                      <label className="text-stone-500 text-sm font-semibold col-span-2">
                        {convertTimeStampToDate(item.createdAt)}
                      </label>
                      <label className="text-blue-300 text-sm font-semibold col-span-2">
                        {formatInteger(item.jumlah_pinjaman)}
                      </label>
                      <label className="text-blue-300 text-sm font-semibold col-span-2">
                        {formatInteger(item.jumlah_cicilan)}
                      </label>
                      <label className="text-red-400 text-sm font-semibold col-span-2">
                        {formatInteger(item.sisa_pinjaman)}
                      </label>
                      <label className="text-stone-500 text-sm font-semibold col-span-3 capitalize">
                        {item.status_pinjaman || '-'}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-500 text-sm">
                    Belum ada riwayat pinjaman
                  </div>
                )}
              </div>
            </>
          </DetailTabMasterKaryawan>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="bg-white rounded-xl">
        <div className="w-full h-full flex gap-1 flex-col border-b-8 border-[#D8EAFF] px-6 py-[2%] justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-black text-sm font-semibold">
              Nama Karyawan
            </label>
            <label className="text-[#636363] text-xl font-normal">
              {karyawan?.data?.name}
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-black text-sm font-semibold">
              Departemen
            </label>
            <label className="text-[#636363] text-xl font-normal">
              {karyawan?.data?.biodata_karyawan[0]?.department?.nama_department}
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6 mt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {topTabs.map((tab) => (
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

        {renderTabContent()}
      </div>

      <LengkapiMasterKaryawanIsi />
    </>
  );
}
