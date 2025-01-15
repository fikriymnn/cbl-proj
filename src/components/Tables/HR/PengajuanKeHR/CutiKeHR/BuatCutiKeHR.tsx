import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import Loading from '../../../../Loading';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';


function BuatCutiKeHR() {
    const [options, setOptions] = useState([]);
    const [options2, setOptions2] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState<any>();

    useEffect(() => {
        getMe()
        getCutiKhusus()
    }, []);

    const [me, setMe] = useState<any>();
    const [idPengaju, setIdPengaju] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setMe(res.data);
            setIdPengaju(res.data.id_karyawan)
            getMasterUser(res?.data.karyawan.biodata_karyawan[0]?.id_department);
            console.log('getme', res.data)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function getMasterUser(id: any) {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan`;
        try {

            const res = await axios.get(url, {
                params: {
                    is_active: true,
                    id_department: id
                },
                withCredentials: true,
            });

            setUserList(res.data.data);
            console.log('user list', res.data.data)
            setOptions(
                res.data.data.map((item: any) => ({
                    value: item.id_karyawan,
                    label: item.nik + ' - ' + item.karyawan?.name + ' - ' + item.bagian?.nama_bagian + ' - ' + item.jabatan
                }))
            );


        } catch (error: any) {

            console.log(error);
        }
    }


    const [sisaCuti, setSisaCuti] = useState<any>();

    const handleChangePointDepatment = (selected: any) => {
        const { value } = selected;
        const filteredData = userList.find(
            (item: any) => item.id_karyawan == value,
            // item.id.includes(parseInt(value));
        );

        console.log(filteredData?.id_karyawan);
        setSisaCuti(filteredData?.sisa_cuti);
        setIdKaryawan(filteredData?.id_karyawan)

    };
    const handleChangePointCuti = (selected: any) => {
        const { value } = selected;
        const filteredData = cutiKhusus.find(
            (item: any) => item.id == value,
            // item.id.includes(parseInt(value));
        );
        console.log(filteredData?.id)
        setDaysDifference(filteredData?.jumlah_hari)
        setAlasanCuti(filteredData?.nama_cuti)
    };


    const [idKaryawan, setIdKaryawan] = useState<any>();
    const [tipeCuti, setTipeCuti] = useState<any>(null);
    const [tglDari, setTglDari] = useState<any>();
    const [tglSampai, setTglSampai] = useState<any>();
    const [alasanCuti, setAlasanCuti] = useState<any>();

    async function postCuti() {

        if (tipeCuti == null) {
            alert('Tipe Cuti Belum Diisi');
            return;
        }
        if (tglDari == null) {
            alert('Tanggal Dari Belum Diisi');
            return;
        }
        if (tglSampai == null) {
            alert('Tanggal Sampai Belum Diisi');
            return;
        }
        if (alasanCuti == null) {
            alert('Alasan Cuti Belum Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanCuti`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    id_karyawan: idKaryawan,
                    id_pengaju: idPengaju,
                    tipe_cuti: tipeCuti,
                    dari: tglDari,
                    sampai: tglSampai,
                    jumlah_hari: daysDifference,
                    alasan_cuti: alasanCuti,
                    sisa_cuti: sisaCuti,
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function postCutiKhusus() {

        if (tipeCuti == null) {
            alert('Tipe Cuti Belum Diisi');
            return;
        }
        if (tglDari == null) {
            alert('Tanggal Dari Belum Diisi');
            return;
        }

        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanCuti`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    id_karyawan: idKaryawan,
                    id_pengaju: idPengaju,
                    tipe_cuti: tipeCuti,
                    dari: tglDari,
                    sampai: endDate,
                    jumlah_hari: daysDifference,
                    alasan_cuti: alasanCuti,
                    sisa_cuti: sisaCuti,
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [daysDifference, setDaysDifference] = useState<any>();
    const [showError, setShowError] = useState(false);
    const [showErrorEarlyDate, setShowErrorEarlyDate] = useState(false);

    useEffect(() => {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 2);

        if (tglDari && tglSampai) {
            if (tglDari <= tglSampai) {
                if (tglDari <= threeDaysLater) {
                    setShowErrorEarlyDate(true);
                } else if (tglDari <= today || (tglDari > today && tglDari >= threeDaysLater)) {
                    setShowErrorEarlyDate(false);
                }
                const diffInMs = Math.abs(tglSampai - tglDari);
                const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
                setDaysDifference(days + 1);
                setShowError(false); // Hide error message

            } else {
                setDaysDifference(null);
                setShowError(true); // Show error message
                setShowErrorEarlyDate(false);
            }
        } else {
            setDaysDifference(null);
            setShowError(false); // Hide error message
            setShowErrorEarlyDate(false);
        }
    }, [tglDari, tglSampai]);


    const handleStartDateChange = (event: any) => {
        setTglDari(new Date(event.target.value));
    };

    const handleEndDateChange = (event: any) => {
        setTglSampai(new Date(event.target.value));

    };
    const [cutiKhusus, setCutiKhusus] = useState<any>();

    async function getCutiKhusus() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/cutiKhusus`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setCutiKhusus(res.data.data)
            setOptions2(
                res.data.data.map((item: any) => ({
                    value: item.id,
                    label: item.nama_cuti + ' - ' + item.jumlah_hari + ' Hari ',
                }))
            );
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const calculateEndDate = () => {
        if (tglDari && daysDifference > 0) {
            const newDate = new Date(tglDari.getTime());
            newDate.setDate(newDate.getDate() + daysDifference - 1);
            return newDate.toISOString().substring(0, 10); // Format as YYYY-MM-DD
        }
        return ''; // Return empty string if no date or daysOff are available
    };
    const endDate = calculateEndDate();
    return (

        <main className="overflow-x-scroll min-h-screen">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl ">
                <div className='grid grid-cols-2 gap-5  border-b-8 border-[#D8EAFF] px-7 py-4 '>
                    <div className='flex flex-col gap-1'>
                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                            Nama
                        </label>
                        <Select
                            placeholder='Cari...'
                            options={options}
                            onChange={(selectedId) => {

                                handleChangePointDepatment(selectedId)
                            }}
                            className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                        >

                        </Select>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                            Hak Cuti Yang Masih Tersedia
                        </label>
                        <label className=' text-[#6c6b6b] text-lg font-semibold'>
                            {sisaCuti}
                        </label>
                    </div>
                </div>
                <div className="relative z-20 w-[40%] bg-transparent dark:bg-form-input px-7 py-4">
                    <label className=' text-[#6c6b6b] text-sm font-semibold'>
                        Tipe Cuti
                    </label>
                    <select
                        onChange={(e) => setTipeCuti(e.target.value)}
                        className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent  px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary 
                                }`}
                    >
                        <option value="" disabled selected className="text-body dark:text-bodydark">
                            Pilih Tipe Cuti
                        </option>
                        <option value="tahunan" className="text-body dark:text-bodydark">
                            TAHUNAN
                        </option>
                        <option value="khusus" className="text-body dark:text-bodydark">
                            KHUSUS
                        </option>

                    </select>
                    <span className="absolute top-[65%] right-7 z-30 -translate-y-1/2">
                        <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g opacity="0.8">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                    fill=""
                                ></path>
                            </g>
                        </svg>
                    </span>
                </div>
                {tipeCuti == 'khusus' ? (
                    <>
                        <div className='grid grid-cols-2 px-7 py-4 gap-5'>


                            <div className='flex flex-col gap-1 z-50'>
                                <div className='grid grid-cols-2 gap-2 items-center'>
                                    <div className="flex flex-col  gap-2">
                                        <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                            Tanggal :
                                        </p>
                                        <input
                                            className='rounded-md bg-[#D8EAFF] px-2'
                                            type="date"
                                            //onChange={(e) => setDateFrom4(e.target.value)}
                                            onChange={handleStartDateChange}
                                        ></input>

                                    </div>
                                    <div className="flex flex-col  gap-2">
                                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                            Jumlah Hari   : {daysDifference}
                                        </label>
                                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                            Sampai : {endDate == null ? '-' : convertTimeStampToDateOnly(endDate)}
                                        </label>
                                    </div>

                                </div>
                                <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                    Pilih Tipe Cuti
                                </label>
                                <Select
                                    placeholder='Cari...'
                                    options={options2}
                                    onChange={(selectedId) => {

                                        handleChangePointCuti(selectedId)
                                    }}
                                    className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                                >

                                </Select>

                            </div>
                            <div>
                                <div className="flex w-full flex-col">
                                    <label className="text-[#6c6b6b] text-sm font-semibold">
                                        Alasan Cuti
                                    </label>
                                    <div className="flex w-full h-full">
                                        <textarea
                                            name="alasan_cuti"

                                            readOnly
                                            value={alasanCuti}

                                            className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                                        />
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className='flex w-full justify-end items-end px-7 py-4'>
                            {(tipeCuti == 'khusus' || sisaCuti >= 1) ? (
                                <>
                                    <button
                                        onClick={() => postCutiKhusus()}
                                        disabled={isLoading}
                                        className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                    >
                                        AJUKAN
                                    </button>
                                </>
                            ) : null}

                        </div>
                    </>
                ) : tipeCuti == 'tahunan' ? (

                    <>
                        <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                            <div className='flex flex-col gap-3'>

                                <div className='grid grid-cols-2 gap-2'>
                                    <div className="flex flex-col  gap-2">
                                        <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                            Dari :
                                        </p>
                                        <input
                                            className='rounded-md bg-[#D8EAFF] px-2'
                                            type="date"
                                            //onChange={(e) => setDateFrom4(e.target.value)}
                                            onChange={handleStartDateChange}
                                        ></input>

                                    </div>
                                    <div className="flex flex-col  gap-2">
                                        <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                            Sampai :
                                        </p>
                                        <input
                                            className='rounded-md bg-[#D8EAFF] px-2'
                                            type="date"
                                            onChange={handleEndDateChange}
                                        //onChange={(e) => setDateFrom4(e.target.value)}
                                        ></input>

                                    </div>
                                </div>

                                {daysDifference !== null && !showError && !showErrorEarlyDate && (
                                    <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                        Jumlah Hari: {daysDifference}
                                    </label>
                                )}

                                {showError && (
                                    <div className="text-red-500">
                                        Tanggal dari tidak boleh kurang dari Tanggal Sampai
                                    </div>
                                )}
                                {showErrorEarlyDate && (
                                    <div className="text-red-500">
                                        Pengajuan Cuti Diajukan maksimal H-3
                                    </div>
                                )}
                            </div>

                            <div className="flex w-full flex-col">
                                <label className="text-[#6c6b6b] text-sm font-semibold">
                                    Alasan Cuti
                                </label>
                                <div className="flex w-full h-full">
                                    <textarea
                                        name="alasan_cuti"

                                        onChange={(e) => { setAlasanCuti(e.target.value) }}

                                        className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                                    />
                                </div>

                            </div>

                        </div>
                        <div className='flex w-full justify-end items-end px-7 py-4'>
                            {!(showError || showErrorEarlyDate) && (tipeCuti == 'khusus' || sisaCuti >= 1) ? (
                                <>
                                    <button
                                        onClick={() => postCuti()}
                                        disabled={isLoading}
                                        className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                    >
                                        AJUKAN
                                    </button>
                                </>
                            ) : null}

                        </div>
                    </>
                ) : null
                }




            </div>
        </main>

    )
}

export default BuatCutiKeHR
