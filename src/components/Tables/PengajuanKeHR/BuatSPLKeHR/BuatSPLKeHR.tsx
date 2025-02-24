import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';


function BuatSPLKeHR() {
    const [options, setOptions] = useState([]);
    const [options3, setOptions3] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState<any>();
    const [joList, setJoList] = useState<any>();
    const [idKaryawan, setIdKaryawan] = useState<any>([]);
    const [error, setError] = useState<string>('');
    const [isCheck, setIsCheck] = useState<boolean>(false);

    useEffect(() => {
        getMe()

        getjoReal()
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
                    label: item.nik + ' - ' + item.karyawan.name + ' - ' + item.bagian?.nama_bagian + ' - ' + item.nama_jabatan
                }))
            );


        } catch (error: any) {

            console.log(error);
        }
    }

    const [joReal, setjoReal] = useState<any>();

    async function getjoReal() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime `;
        try {
            const res = await axios.get(url, {

            });

            console.log(res.data)
            setJoList(res.data.data)
            setOptions3(
                res.data.data.map((item: any) => ({
                    value: item.e_no_jo,
                    label: item.e_no_jo
                }))
            );
        } catch (error: any) {
            console.log(error);
        }
    }
    const [tglDari, setTglDari] = useState<any>();
    const [tglSampai, setTglSampai] = useState<any>();
    const [sisaCuti, setSisaCuti] = useState<any>();

    const handleChangePointDepatment = (selectedOptions: any) => {
        if (!selectedOptions || selectedOptions.length === 0) {
            setSisaCuti(0); // Reset if nothing is selected
            setIdKaryawan([]);
            return;
        }

        // Extract selected IDs
        const selectedIds = selectedOptions.map((option: any) => option.value);

        // Find the corresponding user data in userList
        const filteredData = userList.filter((item: any) =>
            selectedIds.includes(item.id_karyawan)
        );

        console.log("Selected Users:", filteredData);

        // Extract the first user's sisa_cuti (assuming all selected users have the same)
        setSisaCuti(filteredData.length > 0 ? filteredData[0].sisa_cuti : 0);

        // Store the selected user IDs in an array
        setIdKaryawan(filteredData.map((user: any) => user.id_karyawan));
    };
    const handleChangePointDepatmentNoJO = (selected: any) => {
        const { value } = selected;
        const filteredData = joList.find(
            (item: any) => item.e_no_jo == value,
            // item.id.includes(parseInt(value));
        );

        console.log(filteredData?.e_no_jo);
        setjoReal(filteredData?.e_no_jo)

    };
    const [hourDifference, setHourDifference] = useState<number>();

    const handleDariChange = (e: any) => {
        setTglDari(e);

    };

    const handleSampaiChange = (e: any) => {
        setTglSampai(e);

    };

    const handleCheckChange = (e: any) => {
        setIsCheck(e);

    };
    const calculateHourDifference = (dari: any, sampai: any) => {
        if (!tglDari || !tglSampai) {
            setHourDifference(0);
            setError('Please fill in both date fields.');
            return;
        }
        const dariDate = new Date(dari);
        const sampaiDate = new Date(sampai);


        setError('');
        const timeDiffMs = sampaiDate.getTime() - dariDate.getTime();
        let hourDiff = timeDiffMs / (1000 * 60 * 60);


        if (hourDiff < 0) {
            hourDiff = 0;
        }

        if (isCheck) {
            hourDiff -= 0.5; // Subtract 30 minutes (0.5 hours)
        }

        setHourDifference(Math.abs(hourDiff));

        return Math.abs(hourDiff)
    };

    const [alasanLembur, setAlasanLembur] = useState<any>();
    const [targetLembur, setTargetLembur] = useState<any>();
    const [tipeLembur, setTipeLembur] = useState<any>();
    const [jumlahMakan, setJumlahMakan] = useState<any>();

    async function postSPL(bedaJam: any) {
        setIsLoading(true)
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanLembur`;
        try {

            const hitung = calculateHourDifference(tglDari, tglSampai);
            console.log(hitung)
            console.log(tglDari, tglSampai)
            const res = await axios.post(url,
                {
                    karyawan: idKaryawan,
                    id_pengaju: idPengaju,
                    dari: tglDari,
                    sampai: tglSampai,
                    jo_lembur: joReal,
                    lama_lembur: hitung,
                    alasan_lembur: alasanLembur,
                    target_lembur: targetLembur,
                    isIstirahat: isCheck,
                    tipe_lembur: tipeLembur,
                    jumlah_makan: jumlahMakan,
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            console.log(res)
            window.location.reload();

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

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
                            isMulti
                            placeholder='Cari...'
                            options={options}
                            onChange={handleChangePointDepatment}
                            className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                        >

                        </Select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                            No Jo
                        </label>
                        <Select
                            placeholder='Cari...'
                            options={options3}
                            onChange={(selectedId) => {

                                handleChangePointDepatmentNoJO(selectedId)
                            }}
                            className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                        >

                        </Select>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                    <div className='flex flex-col gap-3'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div className="flex flex-col  gap-2">
                                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                    Dari
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
                                    type="datetime-local"
                                    onChange={(e) => handleDariChange(e.target.value)}

                                ></input>

                            </div>
                            <div className="flex flex-col  gap-2">
                                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                    Sampai
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
                                    type="datetime-local"

                                    onChange={(e) => {
                                        handleSampaiChange(e.target.value)

                                    }}
                                ></input>

                            </div>
                        </div>
                        <label className="text-red-400 text-xs font-semibold pl-1">
                            {error}
                        </label>
                    </div>

                    <div className="flex w-full flex-col">
                        <label className="text-[#6c6b6b] text-sm font-semibold">
                            Alasan Lembur
                        </label>
                        <div className="flex w-full h-full">
                            <textarea
                                name="alasan_lembur"
                                onChange={(e) => setAlasanLembur(e.target.value)}
                                className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                            />
                        </div>

                    </div>
                </div>
                <div className='flex w-full justify-end items-end px-7 py-4'>
                    {!(error) ? (
                        <>
                            <button
                                onClick={() => {

                                    postSPL(hourDifference)
                                }}
                                disabled={isLoading}
                                className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                            >
                                AJUKAN
                            </button>
                        </>
                    ) : null}

                </div>

            </div>
        </main>

    )
}

export default BuatSPLKeHR
