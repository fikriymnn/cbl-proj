import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../../Loading';
import convertTimeStampToDate from '../../../../../../utils/convertDate';

function BuatStatusKaryawan() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();
  const [periodeAwal, setPeriodeAwal] = useState<any>(null);
  const [periodeAkhir, setPeriodeAkhir] = useState<any>(null);
  const [jumlahAlpa, setjumlahAlpa] = useState<any>(null);
  const [jumlahIzin, setjumlahIzin] = useState<any>(null);
  const [jumlahTanpaKeterangan, setjumlahTanpaKeterangan] = useState<any>(null);
  const [jumlahKeterlambatan, setjumlahKeterlambatan] = useState<any>(null);
  const [peringatanKe1, setperingatanKe1] = useState<any>(null);
  const [peringatanKe2, setperingatanKe2] = useState<any>(null);
  const [peringatanKe3, setperingatanKe3] = useState<any>(null);
  const [prestasiKerja, setprestasiKerja] = useState<any>(null);
  const [prestasiKerjaPoint, setprestasiKerjaPoint] = useState<any>(null);
  const [kesanPenilai, setkesanPenilai] = useState<any>(null);

  const [penilaian, setPenilaian] = useState<any>([
    {
      nama_point: 'Inisiatif',
      deskripsi:
        '(Menunjukkan kemampuan, Percaya diri, Bekerja berupaya untuk maju)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
    {
      nama_point: 'Kualitas Kerja',
      deskripsi:
        '(Ketetapan, Efektivitas dalam bekerja bebas dari kesalahan-kesalahan)',
      keterangan: '',
      hasil_penilaian: '',
      point_penilaian: '',
    },
  ]);

  const [idKaryawan, setIdKaryawan] = useState<any>(null);
  const [namaKaryawan, setnamaKaryawan] = useState<any>(null);
  const [bagianKaryawan, setbagianKaryawan] = useState<any>(null);
  const [jabatanKaryawan, setjabatanKaryawan] = useState<any>(null);
  const [nikKaryawan, setnikKaryawan] = useState<any>(null);
  const [tglMasukKerja, settglMasukKerja] = useState<any>(null);

  useEffect(() => {
    getMe();
    getMasterUser();
  }, []);

  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setIdPengaju(res.data.id_karyawan);

      console.log('getme', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      setUserList(res.data.data);
      console.log('user list', res.data.data);
      setOptions(
        res.data.data.map((item: any) => ({
          value: item.userid,
          label:
            item.biodata_karyawan[0]?.nik +
            ' - ' +
            item.name +
            ' - ' +
            item.biodata_karyawan[0]?.nama_jabatan,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: any) => item.userid == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.userid);

    setIdKaryawan(filteredData?.userid);
    setnamaKaryawan(filteredData?.karyawan?.name);
    setbagianKaryawan(filteredData?.bagian?.nama_bagian);
    setjabatanKaryawan(filteredData?.nama_jabatan);
    setnikKaryawan(filteredData?.nik);
    settglMasukKerja(filteredData?.tgl_masuk);
  };

  async function postPengajuanStatus() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/hr/pengajuanPromosiStatusKaryawan`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          periode_awal: periodeAwal,
          periode_akhir: periodeAkhir,
          jumlah_alpa: jumlahAlpa,
          jumlah_izin: jumlahIzin,
          jumlah_tanpa_keterangan: jumlahTanpaKeterangan,
          jumlah_keterlambatan: jumlahKeterlambatan,
          peringatan_ke_1: peringatanKe1,
          peringatan_ke_2: peringatanKe2,
          peringatan_ke_3: peringatanKe3,
          prestasi_kerja: prestasiKerja,
          prestasi_kerja_point: prestasiKerjaPoint,
          kesan_penilai: kesanPenilai,
          penilaian: penilaian,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      window.location.reload();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const options2 = [
    { hasil_penilaian: 'Sangat Baik', point_penilaian: 45 },
    { hasil_penilaian: 'Baik', point_penilaian: 35 },
    { hasil_penilaian: 'Cukup', point_penilaian: 25 },
    { hasil_penilaian: 'Kurang', point_penilaian: 18 },
  ];
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedPenilaian = [...penilaian];
    updatedPenilaian[index][field] = value;
    setPenilaian(updatedPenilaian);
    console.log(updatedPenilaian);
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl ">
        <div className="grid grid-cols-2 gap-5  border-b-8 border-[#D8EAFF] px-7 py-4 ">
          <div className="flex flex-col gap-1">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Nama
            </label>
            <Select
              placeholder="Cari..."
              options={options}
              onChange={(selectedId) => {
                handleChangePointDepatment(selectedId);
              }}
              className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 px-7 py-4">
          <div className="flex gap-1">
            <p className="text-black font-bold">Nama</p>
            <p className="text-black text-medium">
              : {namaKaryawan} - {nikKaryawan}
            </p>
          </div>
          <div className="flex gap-1">
            <p className="text-black font-bold">Bagian</p>
            <p className="text-black text-medium">: {bagianKaryawan}</p>
          </div>
          <div className="flex gap-1">
            <p className="text-black font-bold">Jabatan</p>
            <p className="text-black text-medium">: {jabatanKaryawan}</p>
          </div>
          <div className="flex gap-1">
            <p className="text-black font-bold">Tgl masuk kerja</p>
            <p className="text-black text-medium">
              : {convertTimeStampToDate(tglMasukKerja)}
            </p>
          </div>
          <div className="flex gap-1">
            <p className="text-black font-bold">Periode</p>:
            <input
              onChange={(e) => setPeriodeAwal(e.target.value)}
              type="month"
              className="text-black  border-2 border-stroke text-medium"
            ></input>{' '}
            s/d
            <input
              onChange={(e) => setPeriodeAkhir(e.target.value)}
              type="month"
              className="text-black  border-2 border-stroke text-medium"
            ></input>
          </div>
          <p className="text-black text-medium">
            Lakukan analisa untuk kerja karyawan dengan hati-hati, pelajari
            faktor dan masing masing tingkat penilaian.
          </p>
          <p className="text-black font-bold">BAGIAN 1</p>

          {penilaian.map((item: any, index: any) => (
            <div key={index} className="grid grid-cols-12">
              <div className="font-bold text-black">{index + 1}</div>
              <div className="col-span-11">
                <h3 className="font-bold text-black">{item.nama_point}</h3>
                <span>{item.deskripsi} </span>
              </div>
              <div></div>
              <div className="flex flex-col col-span-4">
                <div className="grid grid-cols-3 w-full">
                  <label>Keterangan:</label>
                  <input
                    className="border-2 border-stroke px-2 col-span-2"
                    type="text"
                    value={item.keterangan}
                    onChange={(e) =>
                      handleInputChange(index, 'keterangan', e.target.value)
                    }
                    placeholder="Masukkan keterangan"
                  />
                </div>
                <div className="col-span-2">
                  {options2.map((option: any, optionIndex: any) => (
                    <div key={optionIndex} className="flex items-center mb-1">
                      <input
                        type="radio"
                        name={`penilaian-${index}`}
                        value={option.hasil_penilaian}
                        checked={
                          item.hasil_penilaian === option.hasil_penilaian
                        }
                        onChange={() => {
                          handleInputChange(
                            index,
                            'hasil_penilaian',
                            option.hasil_penilaian,
                          );
                          handleInputChange(
                            index,
                            'point_penilaian',
                            option.point_penilaian,
                          );
                        }}
                        className="mr-2"
                      />
                      <span>
                        {option.hasil_penilaian} (Point:{' '}
                        {option.point_penilaian})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <p className="text-black font-bold pt-4">BAGIAN 2</p>

          <div className="grid grid-cols-10 w-full">
            <label>Alpa</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setjumlahAlpa(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Hari"
              />
              <label>Hari</label>
            </div>
          </div>
          <div className="grid grid-cols-10 w-full">
            <label>Ijin (SKD)</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setjumlahIzin(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Hari"
              />
              <label>Hari</label>
            </div>
          </div>
          <div className="grid grid-cols-10 w-full">
            <label>Tanpa (SKD)</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setjumlahTanpaKeterangan(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Hari"
              />
              <label>Hari</label>
            </div>
          </div>
          <div className="grid grid-cols-10 w-full">
            <label>Keterlambatan</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setjumlahKeterlambatan(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Hari"
              />
              <label>Hari</label>
            </div>
          </div>
          <p className="text-black font-bold pt-4">Teguran Peringatan</p>
          <div className="grid grid-cols-8 w-full">
            <label>Peringatan Ke 1</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setperingatanKe1(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Peringatan Ke-1"
              />
              <label></label>
            </div>
          </div>
          <div className="grid grid-cols-8 w-full">
            <label>Peringatan Ke 2</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setperingatanKe2(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Peringatan Ke-2"
              />
              <label></label>
            </div>
          </div>
          <div className="grid grid-cols-8 w-full">
            <label>Peringatan Ke 3</label>
            <div className="col-span-4 flex gap-2">
              :
              <input
                onChange={(e) => setperingatanKe3(e.target.value)}
                className="border-2 border-stroke px-2 "
                type="text"
                placeholder="Masukkan Peringatan Ke-3"
              />
              <label></label>
            </div>
          </div>
          <p className="text-black font-bold pt-4">Prestasi Kerja</p>
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex w-full gap-7">
              <div className="flex gap-1">
                <input
                  onChange={(e) => {
                    setprestasiKerjaPoint(45);
                    setprestasiKerja(e.target.value);
                  }}
                  type="radio"
                  name="tipeKryawan"
                  id="tipeKryawan1"
                  value={'Baik Sekali'}
                />
                Baik Sekali (36-45)
              </div>

              <div className="flex gap-1">
                <input
                  onChange={(e) => {
                    setprestasiKerjaPoint(35);
                    setprestasiKerja(e.target.value);
                  }}
                  type="radio"
                  name="tipeKryawan"
                  id="tipeKryawan2"
                  value={'Baik'}
                />
                Baik (26-35)
              </div>
              <div className="flex gap-1">
                <input
                  onChange={(e) => {
                    setprestasiKerjaPoint(25);
                    setprestasiKerja(e.target.value);
                  }}
                  type="radio"
                  name="tipeKryawan"
                  id="tipeKryawan2"
                  value={'Cukup'}
                />
                Cukup (19-25)
              </div>
              <div className="flex gap-1">
                <input
                  onChange={(e) => {
                    setprestasiKerjaPoint(18);
                    setprestasiKerja(e.target.value);
                  }}
                  type="radio"
                  name="tipeKryawan"
                  id="tipeKryawan2"
                  value={'Kurang'}
                />
                Kurang (0-18)
              </div>
            </div>
          </div>
          <p className="text-black font-bold pt-4">Kesan Penilai</p>
          <textarea
            onChange={(e) => setkesanPenilai(e.target.value)}
            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
          ></textarea>
        </div>
        <div className="px-[3%] py-[3%]">
          <button
            onClick={() => {
              postPengajuanStatus();
            }}
            disabled={isLoading}
            className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
          >
            AJUKAN
          </button>
        </div>
      </div>
    </main>
  );
}

export default BuatStatusKaryawan;
