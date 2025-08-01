import { useEffect, useState } from 'react';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Select from 'react-select';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';

const MasterKategori = () => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [masterKategori, setmasterKategori] = useState<any>();
    const [masterMesin, setmasterMesin] = useState<any>();
    const [selectedID, setSelectedID] = useState<any>();
    useEffect(() => {
        getMasterMesin()
        getmasterKategori();
    }, []);

    async function getmasterKategori() {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setmasterKategori(res.data);
            console.log('kapasitas', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [namaKategori, setnamaKategori] = useState<any>();
    const [settingA, setsettingA] = useState<any>(0);
    const [settingB, setsettingB] = useState<any>(0);
    const [settingC, setsettingC] = useState<any>(0);
    const [kapasitasA, setkapasitasA] = useState<any>(0);
    const [kapasitasB, setkapasitasB] = useState<any>(0);
    const [kapasitasC, setkapasitasC] = useState<any>(0);

    const [namaKategoriEdit, setnamaKategoriEdit] = useState<any>();
    const [settingAEdit, setsettingAEdit] = useState<any>(0);
    const [settingBEdit, setsettingBEdit] = useState<any>(0);
    const [settingCEdit, setsettingCEdit] = useState<any>(0);
    const [kapasitasAEdit, setkapasitasAEdit] = useState<any>(0);
    const [kapasitasBEdit, setkapasitasBEdit] = useState<any>(0);
    const [kapasitasCEdit, setkapasitasCEdit] = useState<any>(0);

    async function postMasterKategori() {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas`;
        try {
            setIsLoading(true)
            const res = await axios.post(url, {
                mesin: selectedID,
                nama_kategori: namaKategori,
                setting_a: settingA,
                setting_b: settingB,
                setting_c: settingC,
                kapasitas_a: kapasitasA,
                kapasitas_b: kapasitasB,
                kapasitas_c: kapasitasC,
            }, {
                withCredentials: true,
            });
            setIsLoading(false)
            setSelectedID(null)
            setnamaKategori('')
            setsettingA(0)
            setsettingB(0)
            setsettingC(0)
            setkapasitasA(0)
            setkapasitasB(0)
            setkapasitasC(0)
            getmasterKategori();
            closeModalHistory()
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function putMasterKategori(id: any, mesin: any, i: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url, {
                mesin: mesin,
                nama_kategori: namaKategoriEdit,
                setting_a: settingAEdit,
                setting_b: settingBEdit,
                setting_c: settingCEdit,
                kapasitas_a: kapasitasAEdit,
                kapasitas_b: kapasitasBEdit,
                kapasitas_c: kapasitasCEdit,
            }, {
                withCredentials: true,
            });
            alert('Edit Data Berhasil')
            setIsLoading(false)
            setSelectedID(null)
            setnamaKategoriEdit('')
            setsettingAEdit(0)
            setsettingBEdit(0)
            setsettingCEdit(0)
            setkapasitasAEdit(0)
            setkapasitasBEdit(0)
            setkapasitasCEdit(0)
            getmasterKategori();
            closeEdit(i)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function hapusKategori(id: any) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Kategori Ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas/${id}`;
            try {

                setIsLoading(true)
                const res = await axios.delete(url,

                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                getmasterKategori()
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    async function getMasterMesin() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-mesin`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {

            });
            console.log('mesin', res.data.data);
            setIsLoading(false)
            setmasterMesin(res.data.data)
            setOptions(
                res.data?.data?.map((item: any) => ({
                    value: item.mesin,
                    label: item.mesin,
                }))
            );

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);


    const [showEdit, setshowEdit] = useState<any>([]);
    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setshowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setshowEdit(onchangeVal);
    };
    const handleChangePointDepatment = (selected: any) => {
        const { value } = selected;
        const filteredData = masterMesin.find(
            (item: any) => item.mesin == value,
            // item.id.includes(parseInt(value));
        );

        console.log(filteredData?.mesin);

        setSelectedID(filteredData?.mesin);


    };
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl flex flex-col gap-1 py-[1%]">
                <div className='flex w-full justify-between pb-2 px-[1%] border-b-8 border-[#D8EAFF]'>

                    <button
                        onClick={() => openModalHistory()}
                        className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1'>
                        TAMBAH KATEGORI
                    </button>
                    {showHistory == true && (
                        <>
                            <ModalKosonganSmall
                                isOpen={showHistory}
                                onClose={() => closeModalHistory()}
                                judul={'Tambah Kategori'}
                            >
                                <>
                                    <div className='flex flex-col gap-1 px-[1%] py-[1%]'>
                                        <Select
                                            placeholder='Cari Mesin '
                                            options={options}
                                            onChange={(selectedId) => {

                                                handleChangePointDepatment(selectedId)
                                            }}
                                            className={`relative z-30 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                                        >

                                        </Select>
                                        <label className="text-black text-xs font-bold">Nama Kategori</label>
                                        <input
                                            onChange={(e) => setnamaKategori(e.target.value)}
                                            type="text"
                                            className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                        />
                                        <div className='grid grid-cols-3 gap-2'>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Setting A</label>
                                                <input
                                                    onChange={(e) => setsettingA(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Setting B</label>
                                                <input
                                                    onChange={(e) => setsettingB(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Setting C</label>
                                                <input
                                                    onChange={(e) => setsettingC(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-3 gap-2'>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Kapasitas A</label>
                                                <input
                                                    onChange={(e) => setkapasitasA(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Kapasitas B</label>
                                                <input
                                                    onChange={(e) => setkapasitasB(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <label className="text-black text-xs font-bold">Kapasitas C</label>
                                                <input
                                                    onChange={(e) => setkapasitasC(e.target.value)}
                                                    type="number"
                                                    className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                disabled={isLoading}
                                                onClick={() => postMasterKategori()}
                                                className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                            >
                                                {isLoading ? 'Loading...' : 'TAMBAH'}
                                            </button>

                                        </div>
                                    </div>
                                </>
                            </ModalKosonganSmall>
                        </>
                    )
                    }
                </div>
                <div className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                    <p className='text-[#646464] text-xs font-bold col-span-2'>

                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting A
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting B
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting C
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas A
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas B
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas C
                    </p>
                </div>
                <div className='flex w-full flex-col bg-white'>

                    {masterKategori?.data?.map((data: any, i: number) => (
                        <>
                            <div key={i} className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.nama_mesin}
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.nama_kategori}
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.setting_a}
                                </p>

                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.setting_b}
                                </p>

                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.setting_c}
                                </p>

                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.kapasitas_a}
                                </p>

                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.kapasitas_b}
                                </p>

                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.kapasitas_c}
                                </p>
                                <div className='flex flex-col gap-1'>
                                    <button
                                        onClick={() => openEdit(i)}
                                        className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Edit
                                    </button>
                                    {showEdit[i] == true && (

                                        <ModalKosonganSmall
                                            isOpen={showEdit[i]}
                                            onClose={() => closeEdit(i)}
                                            judul={'Edit Kategori'}
                                        >
                                            <>
                                                <div className='flex flex-col gap-1 px-[1%] py-[1%]'>
                                                    <label className="text-black text-xs font-bold">{data.nama_mesin}</label>
                                                    <label className="text-black text-xs font-bold">Nama Kategori</label>
                                                    <input
                                                        onChange={(e) => setnamaKategoriEdit(e.target.value)}
                                                        defaultValue={data.nama_kategori}
                                                        type="text"
                                                        className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                    />
                                                    <div className='grid grid-cols-3 gap-2'>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Setting A</label>
                                                            <input
                                                                onChange={(e) => setsettingAEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.setting_a}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Setting B</label>
                                                            <input
                                                                onChange={(e) => setsettingBEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.setting_b}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Setting C</label>
                                                            <input
                                                                onChange={(e) => setsettingCEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.setting_c}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='grid grid-cols-3 gap-2'>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Kapasitas A</label>
                                                            <input
                                                                onChange={(e) => setkapasitasAEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.kapasitas_a}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Kapasitas B</label>
                                                            <input
                                                                onChange={(e) => setkapasitasBEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.kapasitas_b}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                        <div className='flex flex-col gap-1'>
                                                            <label className="text-black text-xs font-bold">Kapasitas C</label>
                                                            <input
                                                                onChange={(e) => setkapasitasCEdit(e.target.value)}
                                                                type="number"
                                                                defaultValue={data.kapasitas_c}
                                                                className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="pt-4">
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => putMasterKategori(data.id, data.mesin, i)}
                                                            className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                                        >
                                                            {isLoading ? 'Loading...' : 'SIMPAN'}
                                                        </button>

                                                    </div>
                                                </div>
                                            </>
                                        </ModalKosonganSmall>
                                    )}
                                    <button
                                        onClick={() => hapusKategori(data.id)}
                                        className='px-2 py-1  text-xs bg-red-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}

                </div>

            </div >
        </main >
    );
};

export default MasterKategori;
