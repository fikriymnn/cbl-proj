import axios from 'axios';
import React, { useEffect, useState } from 'react'

import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../utils/converDateToTime';

import Loading from '../../../Loading';

import ModalXL from '../../PPIC/JadwalProduksi/ModalXL';
import convertTimeStampToDate from '../../../../utils/convertDate';

function OsKaryawan() {

    const [isLoading, setIsLoading] = useState(false);
    const [lkh, setLkh] = useState<any>();
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
            deskripsi: '(Menunjukkan kemampuan, Percaya diri, Bekerja berupaya untuk maju)',
            keterangan: '',
            hasil_penilaian: '',
            point_penilaian: ''
        },
        {
            nama_point: 'Kualitas Kerja',
            deskripsi: '(Ketetapan, Efektivitas dalam bekerja bebas dari kesalahan-kesalahan)',
            keterangan: '',
            hasil_penilaian: '',
            point_penilaian: ''
        }
    ]);

    useEffect(() => {
        getMe()
        getLKH()
    }, []);

    const [idPengaju, setIdPengaju] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setIdPengaju(res.data.id_karyawan)
            console.log('getme', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error.data.msg);
        }
    }

    async function getLKH() {
        const url = `${import.meta.env.VITE_API_LINK}/outstandingKaryawan`;
        try {
            const res = await axios.get(url,

                {
                    params: {
                        status: 'incoming',
                        is_active: true
                    },
                    withCredentials: true,
                });

            setLkh(res.data.data);
            console.log('osAbsen', res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [showModal, setShowModal] = useState<boolean[]>([]);
    const openModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);

    };
    const closeModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);


    };
    async function postPengajuanStatus(idK: any, idd: any, index: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosiStatusKaryawan`;
        const url2 = `${import.meta.env.VITE_API_LINK}/outstandingKaryawan/done/${idd}`;

        try {
            setIsLoading(true);
            const res1 = await axios.post(url, {
                id_karyawan: idK,
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
            }, {
                withCredentials: true,
            });

            // Second API Call (Only if the first one succeeds)
            const res2 = await axios.put(url2, {}, {
                withCredentials: true,
            });
            const updatedModalStates = [...showModal];
            updatedModalStates[index] = false;
            setShowModal(updatedModalStates);
            setIsLoading(false);
            alert('Respon Berhasil');
            getLKH(); // Refresh data or handle UI update
        } catch (error: any) {
            setIsLoading(false);
            console.error(error);
            alert('Terjadi kesalahan, silakan coba lagi.');
        }
    }
    const options2 = [
        { hasil_penilaian: 'Sangat Baik', point_penilaian: 45 },
        { hasil_penilaian: 'Baik', point_penilaian: 35 },
        { hasil_penilaian: 'Cukup', point_penilaian: 25 },
        { hasil_penilaian: 'Kurang', point_penilaian: 18 }
    ];
    const handleInputChange = (index: number, field: string, value: string) => {
        const updatedPenilaian = [...penilaian];
        updatedPenilaian[index][field] = value;
        setPenilaian(updatedPenilaian);
        console.log(updatedPenilaian)
    };
    return (

        <>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]'>
                {isLoading && <Loading />}
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>


                    <div className='col-span-2'>Nama - NIK</div>
                    <div className='col-span-2'>Department</div>
                    <div className='col-span-5'>Deskripsi</div>

                    <div className='col-span-3 flex w-full justify-end'>Action</div>
                </div>

            </div>
            {lkh?.map(
                (data: any, i: number) => {

                    return (
                        <>
                            <div
                                key={i}
                                className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                                <p className='w-20'>{i + 1}</p>
                                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>



                                    <div className='col-span-2'>{data.karyawan?.name} - {data.karyawan?.biodata_karyawan[0]?.nik}</div>
                                    <div className='col-span-2'>{data.department?.nama_department}</div>
                                    <div className='col-span-5'> {data.deskripsi}</div>

                                    <div className='col-span-3 w-full flex justify-end'>
                                        <div>
                                            <button
                                                onClick={() => openModalModal(i)}
                                                className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                            >
                                                Respon
                                            </button>
                                            {showModal[i] == true && (
                                                <>
                                                    <ModalXL
                                                        isOpen={showModal[i]}
                                                        onClose={() => closeModalModal(i)}
                                                        judul={'Respon Tiket Outstanding Karyawan'}>
                                                        <>
                                                            <div className='grid grid-cols-1 gap-1 px-7 py-4'>
                                                                <div className='flex gap-1'>
                                                                    <p className='text-black font-bold'>
                                                                        Nama
                                                                    </p>
                                                                    <p className='text-black text-medium'>
                                                                        : {data.karyawan?.name} - {data.karyawan?.biodata_karyawan[0]?.nik}
                                                                    </p>
                                                                </div>
                                                                <div className='flex gap-1'>
                                                                    <p className='text-black font-bold'>
                                                                        Bagian
                                                                    </p>
                                                                    <p className='text-black text-medium'>
                                                                        : {data.karyawan?.biodata_karyawan[0]?.nama_bagian}
                                                                    </p>
                                                                </div>
                                                                <div className='flex gap-1'>
                                                                    <p className='text-black font-bold'>
                                                                        Jabatan
                                                                    </p>
                                                                    <p className='text-black text-medium'>
                                                                        : {data.karyawan?.biodata_karyawan[0]?.nama_jabatan}
                                                                    </p>
                                                                </div>
                                                                <div className='flex gap-1'>
                                                                    <p className='text-black font-bold'>
                                                                        Tgl masuk kerja
                                                                    </p>
                                                                    <p className='text-black text-medium'>
                                                                        : {convertTimeStampToDate(data.karyawan?.biodata_karyawan[0]?.tgl_masuk)}
                                                                    </p>
                                                                </div>
                                                                <div className='flex gap-1'>
                                                                    <p className='text-black font-bold'>
                                                                        Periode
                                                                    </p>
                                                                    :<input onChange={(e) => setPeriodeAwal(e.target.value)} type='month' className='text-black  border-2 border-stroke text-medium'>

                                                                    </input> s/d
                                                                    <input onChange={(e) => setPeriodeAkhir(e.target.value)} type='month' className='text-black  border-2 border-stroke text-medium'>

                                                                    </input>
                                                                </div>
                                                                <p className='text-black text-medium'>
                                                                    Lakukan analisa untuk kerja karyawan dengan hati-hati, pelajari faktor dan masing masing tingkat penilaian.
                                                                </p>
                                                                <p className='text-black font-bold'>
                                                                    BAGIAN 1
                                                                </p>
                                                                {penilaian.map((item: any, index: any) => (
                                                                    <div key={index} className='grid grid-cols-12'>
                                                                        <div className='font-bold text-black'>
                                                                            {index + 1}
                                                                        </div>
                                                                        <div className='col-span-11'>
                                                                            <h3 className='font-bold text-black'>{item.nama_point}</h3><span>{item.deskripsi} </span>
                                                                        </div>
                                                                        <div></div>
                                                                        <div className='flex flex-col col-span-4'>

                                                                            <div className='grid grid-cols-3 w-full'>
                                                                                <label>
                                                                                    Keterangan:
                                                                                </label>
                                                                                <input
                                                                                    className='border-2 border-stroke px-2 col-span-2'
                                                                                    type="text"
                                                                                    value={item.keterangan}
                                                                                    onChange={(e) => handleInputChange(index, 'keterangan', e.target.value)}
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
                                                                                            checked={item.hasil_penilaian === option.hasil_penilaian}
                                                                                            onChange={() => {
                                                                                                handleInputChange(index, 'hasil_penilaian', option.hasil_penilaian);
                                                                                                handleInputChange(index, 'point_penilaian', option.point_penilaian);
                                                                                            }}
                                                                                            className="mr-2"
                                                                                        />
                                                                                        <span>{option.hasil_penilaian} (Point: {option.point_penilaian})</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                ))}
                                                                <p className='text-black font-bold pt-4'>
                                                                    BAGIAN 2
                                                                </p>
                                                                <div className='grid grid-cols-10 w-full'>
                                                                    <label>
                                                                        Alpa
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setjumlahAlpa(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Hari"
                                                                        />
                                                                        <label>
                                                                            Hari
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-10 w-full'>
                                                                    <label>
                                                                        Ijin (SKD)
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setjumlahIzin(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Hari"
                                                                        />
                                                                        <label>
                                                                            Hari
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-10 w-full'>
                                                                    <label>
                                                                        Tanpa (SKD)
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setjumlahTanpaKeterangan(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Hari"
                                                                        />
                                                                        <label>
                                                                            Hari
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-10 w-full'>
                                                                    <label>
                                                                        Keterlambatan
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setjumlahKeterlambatan(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Hari"
                                                                        />
                                                                        <label>
                                                                            Hari
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <p className='text-black font-bold pt-4'>
                                                                    Teguran Peringatan
                                                                </p>
                                                                <div className='grid grid-cols-8 w-full'>
                                                                    <label>
                                                                        Peringatan Ke 1
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setperingatanKe1(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Peringatan Ke-1"
                                                                        />
                                                                        <label>

                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-8 w-full'>
                                                                    <label>
                                                                        Peringatan Ke 2
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setperingatanKe2(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Peringatan Ke-2"
                                                                        />
                                                                        <label>

                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-8 w-full'>
                                                                    <label>
                                                                        Peringatan Ke 3
                                                                    </label>
                                                                    <div className='col-span-4 flex gap-2'>
                                                                        :<input
                                                                            onChange={(e) => setperingatanKe3(e.target.value)}
                                                                            className='border-2 border-stroke px-2 '
                                                                            type="text"
                                                                            placeholder="Masukkan Peringatan Ke-3"
                                                                        />
                                                                        <label>

                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <p className='text-black font-bold pt-4'>
                                                                    Prestasi Kerja
                                                                </p>
                                                                <div className='flex flex-col gap-1 pt-2'>

                                                                    <div className='flex w-full gap-7'>

                                                                        <div className='flex gap-1'>
                                                                            <input
                                                                                onChange={(e) => {
                                                                                    setprestasiKerjaPoint(45)
                                                                                    setprestasiKerja(e.target.value)
                                                                                }}
                                                                                type='radio' name='tipeKryawan' id='tipeKryawan1' value={'Baik Sekali'} />Baik Sekali (36-45)
                                                                        </div>

                                                                        <div className='flex gap-1'>
                                                                            <input
                                                                                onChange={(e) => {
                                                                                    setprestasiKerjaPoint(35)
                                                                                    setprestasiKerja(e.target.value)
                                                                                }}
                                                                                type='radio' name='tipeKryawan' id='tipeKryawan2' value={'Baik'} />Baik (26-35)
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <input
                                                                                onChange={(e) => {
                                                                                    setprestasiKerjaPoint(25)
                                                                                    setprestasiKerja(e.target.value)
                                                                                }}
                                                                                type='radio' name='tipeKryawan' id='tipeKryawan2' value={'Cukup'} />Cukup (19-25)
                                                                        </div>
                                                                        <div className='flex gap-1'>
                                                                            <input
                                                                                onChange={(e) => {
                                                                                    setprestasiKerjaPoint(18)
                                                                                    setprestasiKerja(e.target.value)
                                                                                }}
                                                                                type='radio' name='tipeKryawan' id='tipeKryawan2' value={'Kurang'} />Kurang (0-18)
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className='text-black font-bold pt-4'>
                                                                    Kesan Penilai
                                                                </p>
                                                                <textarea
                                                                    onChange={(e) => setkesanPenilai(e.target.value)}
                                                                    className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                ></textarea>
                                                            </div>
                                                            <div className='px-[3%] py-[3%]'>

                                                                <button
                                                                    onClick={() => {
                                                                        postPengajuanStatus(data.id_karyawan, data.id, i)

                                                                    }}
                                                                    disabled={isLoading}
                                                                    className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                                                >
                                                                    AJUKAN
                                                                </button>
                                                            </div>

                                                        </>
                                                    </ModalXL>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </>
                    );
                },
            )}

        </>

    )
}

export default OsKaryawan