import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import formatInteger from '../../../../utils/formaterInteger';
import convertTimeStampToDate from '../../../../utils/convertDate';

function RekapWasteQC() {
    const [isLoading, setIsLoading] = useState(false);
    const [waste, setWaste] = useState<any>();
    const [dateFrom, setDateFrom] = useState<any>(null);
    const [dateTo, setDateTo] = useState<any>(null);

    const [wasteMaster, setWasteMaster] = useState<any>();


    useEffect(() => {
        // getWaste(null, null)
        getWasteMaster()
    }, []);

    async function getWaste(dateFrom1: any, dateTo1: any) {
        console.log(dateFrom1, dateTo1)
        const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`;
        const url = `${import.meta.env.VITE_API_LINK}/reportWaste`;
        try {
            setIsLoading(true)
            const res2 = await axios.get(url2, {
                params: {
                    first_date: dateFrom1,
                    last_date: dateTo1,
                }
            })
            const res = await axios.post(url,
                {
                    data_waste_master: wasteMaster,
                    data_waste_p1: res2.data,
                    start_date: dateFrom1,
                    end_date: dateTo1,
                },
                {
                    withCredentials: true,
                });


            setIsLoading(false)
            setWaste(res.data);
            console.log('waste2', res2);
            console.log('waste', res);
        } catch (error: any) {
            setIsLoading(false)
            console.log('ada', error);
        }
    }
    async function getWasteMaster() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/master-waste`;
        try {
            setIsLoading(true)
            const res = await axios.get(url,
                {

                });
            setIsLoading(false)
            setWasteMaster(res.data.waste)
            console.log('waste master', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log('master waste', error);
        }
    }

    const [showDetail, setShowDetail] = useState<boolean[]>(
        new Array(waste != null && waste.length).fill(false),
    );

    const handleClickDetail = (index: number) => {
        setShowDetail((prevState) => {
            const updatedShowDetail = [...prevState]; // Create a copy
            updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
            return updatedShowDetail;
        });
    };

    const [activeComponent, setActiveComponent] = useState('component1');

    const showComponent1 = () => {
        setActiveComponent('component1');
    };

    const showComponent2 = () => {
        setActiveComponent('component2');
    };
    const showComponent3 = () => {
        setActiveComponent('component3');
    };

    const showComponent4 = () => {
        setActiveComponent('component4');
    }
    const [showModal0, setShowModal0] = useState<any>([])
    const openModal0 = (i: any) => {
        const onchangeVal: any = [...showModal0];
        onchangeVal[i] = true;

        setShowModal0(onchangeVal);
    };
    const closeModal0 = (i: any) => {
        const onchangeVal: any = [...showModal0];
        onchangeVal[i] = false;

        setShowModal0(onchangeVal);
    };

    const [showModal, setShowModal] = useState<any>([])
    const openModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);
    };
    const closeModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);
    };

    const [showModal1, setShowModal1] = useState<any>([])
    const openModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = true;

        setShowModal1(onchangeVal);
    };
    const closeModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = false;

        setShowModal1(onchangeVal);
    };
    const [showModal2, setShowModal2] = useState<any>([])
    const openModal2 = (i: any) => {
        const onchangeVal: any = [...showModal2];
        onchangeVal[i] = true;

        setShowModal2(onchangeVal);
    };
    const closeModal2 = (i: any) => {
        const onchangeVal: any = [...showModal2];
        onchangeVal[i] = false;

        setShowModal2(onchangeVal);
    };
    const [showModal3, setShowModal3] = useState<any>([])
    const openModal3 = (i: any) => {
        const onchangeVal: any = [...showModal3];
        onchangeVal[i] = true;

        setShowModal3(onchangeVal);
    };
    const closeModal3 = (i: any) => {
        const onchangeVal: any = [...showModal3];
        onchangeVal[i] = false;

        setShowModal3(onchangeVal);
    };
    const [showModal4, setShowModal4] = useState<any>([])
    const openModal4 = (i: any) => {
        const onchangeVal: any = [...showModal4];
        onchangeVal[i] = true;

        setShowModal4(onchangeVal);
    };
    const closeModal4 = (i: any) => {
        const onchangeVal: any = [...showModal4];
        onchangeVal[i] = false;

        setShowModal4(onchangeVal);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchQuery2, setSearchQuery2] = useState('');

    // Fungsi untuk menghandle data yang mungkin null atau undefined
    const normalizeString = (str: any) => (str ? str.toString().toLowerCase() : '');

    // Filter hanya berlaku jika searchQuery tidak kosong, jika kosong tampilkan semua data
    const filteredJo = waste?.dataWasteByJo?.filter((data: any) => {
        if (!data) return true; // Tetap tampilkan data meskipun null
        if (!searchQuery) return true; // Jika tidak ada pencarian, tampilkan semua data

        return (
            normalizeString(data.no_jo).includes(searchQuery.toLowerCase()) ||
            normalizeString(data.nama_produk).includes(searchQuery.toLowerCase()) ||
            normalizeString(data.no_io).includes(searchQuery.toLowerCase()) ||
            normalizeString(data.customer).includes(searchQuery.toLowerCase())
        );
    }) || [];

    const filteredJo2 = waste?.dataWasteByJoReplace?.filter((data: any) => {
        if (!data) return true; // Tetap tampilkan data meskipun null
        if (!searchQuery2) return true; // Jika tidak ada pencarian, tampilkan semua data

        return (
            normalizeString(data.no_jo).includes(searchQuery2.toLowerCase()) ||
            normalizeString(data.nama_produk).includes(searchQuery2.toLowerCase()) ||
            normalizeString(data.no_io).includes(searchQuery2.toLowerCase()) ||
            normalizeString(data.customer).includes(searchQuery2.toLowerCase())
        );
    }) || [];


    // Menampilkan pesan jika tidak ada hasil pencarian
    const displayedJo = filteredJo.length > 0 ? filteredJo : [{ no_jo: "Data tidak ada", nama_produk: "", no_io: "", customer: "" }];
    const displayedJo2 = filteredJo2.length > 0 ? filteredJo2 : [{ no_jo: "Data tidak ada", nama_produk: "", no_io: "", customer: "" }];

    return (
        <div className='rounded-md'>
            {isLoading && <Loading />}
            <div className=" rounded-md shadow-md md:w-12/12 mb-5">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0  rounded-md bg-white mb-2">
                    <p className="my-auto text-sm text-primary font-semibold">
                        Pilih Tanggal
                    </p>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Dari:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateFrom(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex md:justify-center items-center gap-2">
                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                            Sampai:
                        </p>

                        <input
                            className='rounded-full bg-[#D8EAFF] px-2'
                            type="date"
                            onChange={(e) => setDateTo(e.target.value)}
                        ></input>

                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            disabled={isLoading}
                            onClick={() => {
                                getWaste(dateFrom, dateTo)
                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Tampilkan
                        </button>
                    </div>
                    <div className="flex justify-center my-5">
                        <button
                            disabled={isLoading}
                            onClick={() => {
                                getWaste(null, null)

                            }}
                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                        >
                            Reset
                        </button>
                    </div>

                    <table className="w-full border-collapse border-x border-y border-gray-300">

                        <thead>
                            <tr className="bg-blue-100 border-b border-gray-300">
                                <th className="px-5 py-2 text-sm font-bold text-blue-500 text-left border-x border-gray-300">Detail By Kategori</th>
                                <th className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300">Qty</th>
                                <th className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300">% Qty</th>
                                <th className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300">Frekuensi</th>
                                <th className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300">% Frekuensi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(() => {
                                const totalDefects = waste?.dataByKategori?.dataKendala?.reduce(
                                    (sum: number, kendala: any) => sum + (kendala.total_calculated_defect || 0),
                                    0
                                ) || 0;

                                const totalJoLength = waste?.dataByKategori?.dataKendala?.reduce(
                                    (sum: number, kendala: any) => sum + kendala.jo.length,
                                    0
                                ) || 0;

                                return waste?.dataByKategori?.dataKendala?.map((kendala: any, i: number) => {
                                    const qty = kendala.total_calculated_defect || 0;
                                    const percentage = totalDefects > 0 ? ((qty / totalDefects) * 100).toFixed(2) : '0';
                                    const joPercentage = totalJoLength > 0 ? ((kendala.jo.length / totalJoLength) * 100).toFixed(2) : '0';

                                    return (
                                        <tr key={i} className="border-b border-gray-300">
                                            <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                                                {(kendala.kategori_kendala == 0 || kendala.kategori_kendala == null) ? '0' : formatInteger(kendala.kategori_kendala)}
                                            </td>
                                            <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                                                {qty === 0 ? '0' : formatInteger(qty.toFixed(0))}
                                            </td>
                                            <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                                                {percentage}%
                                            </td>
                                            <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                                                {kendala.jo.length}
                                            </td>
                                            <td className="px-5 py-2 text-sm text-black ">
                                                {joPercentage}%
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                        <thead>
                            <tr className="bg-blue-100 border-b border-gray-300 border-x border-gray-300 ">
                                <th colSpan={2} className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300 "> Total JO Waste: {waste?.dataWasteByJo?.length}</th>
                                <th colSpan={2} className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300"> Total JO Kendala: {waste?.dataWasteByJoReplace?.length}</th>
                            </tr>
                        </thead>
                    </table>


                </div>

                <div className='flex gap-3 w-full justify-center'>
                    <div className='flex flex-col gap-2 border-2 w-[50%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Waste
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button onClick={showComponent1} className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste By JO
                            </button>
                            <button onClick={showComponent2} className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste All
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 border-2 w-[50%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Kendala
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button onClick={showComponent3} className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Kendala By JO
                            </button>
                            <button onClick={showComponent4} className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Kendala All
                            </button>
                        </div>
                    </div>

                </div>


                {activeComponent === 'component1' ? (
                    <>

                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">
                            <div className='flex  bg-white py-2 px-2 flex-col'>
                                <label className='justify-center text-black flex w-full text-xl font-bold '>
                                    Waste Ke Kendala By JO
                                </label>
                                <label className='text-xl text-blue-400 font-semibold'>
                                    {dateFrom == null ? '' : convertTimeStampToDate(dateFrom)}  ~  {dateTo == null ? '' : convertTimeStampToDate(dateTo)}
                                </label>

                                <input type="text"
                                    value={searchQuery}
                                    typeof='search'
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='border-2 border-stroke rounded-md w-[30%]  px-2 py-1 ' placeholder='Cari Jo, IO, Customer, Produk' />
                            </div>

                            {filteredJo?.length === 0 && (
                                <div className="text-red-500 text-center font-semibold mt-2">
                                    Data tidak ditemukan
                                </div>
                            )}
                            {filteredJo?.map((data: any, i: any) => {
                                return (
                                    <>

                                        <div key={i} className='rounded-md max-w-screen gap-2 flex flex-col overflow-x-auto text-stone-400 bg-white border-2 border-black'>
                                            {/* Top Content */}
                                            <div
                                                className='grid grid-cols-12 items-center justify-center gap-3 border-b-2 border-stroke pt-2 px-[1%] hover:cursor-pointer'
                                                onClick={() => handleClickDetail(i)} // Trigger detail view on row click
                                            >
                                                <label className='text-sm font-semibold text-black col-span-2'>
                                                    No JO
                                                </label>
                                                <label className='text-sm font-semibold text-black'>
                                                    No IO
                                                </label>
                                                <label className='text-sm font-semibold text-black col-span-2'>
                                                    Customer
                                                </label>
                                                <label className='text-sm font-semibold text-black col-span-3'>
                                                    Produk
                                                </label>
                                                <div className='flex justify-center text-sm font-semibold text-black col-span-3'>
                                                    DEFECT PERPROSES
                                                </div>
                                                <label className='text-sm font-semibold text-black'>
                                                    Total
                                                </label>
                                            </div>

                                            {/* Main Content */}
                                            <div className='grid grid-cols-12 items-center justify-center gap-3 px-[1%]'>
                                                <label className='text-sm text-black col-span-2'>
                                                    {i + 1}. {data.no_jo}
                                                </label>
                                                <label className='text-sm text-black'>
                                                    {data.no_io}
                                                </label>
                                                <label className='text-sm text-black col-span-2'>
                                                    {data.customer}
                                                </label>
                                                <label className='text-sm text-black col-span-3'>
                                                    {data.nama_produk}
                                                </label>


                                                <div className='grid grid-cols-3 col-span-3 gap-2'>
                                                    {/* POTONG Section */}
                                                    <button
                                                        onClick={() => openModal0(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>POTONG</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.POTONG?.total_defect}
                                                        </label>
                                                    </button>
                                                    {showModal0[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal0[i]}
                                                            onClose={() => closeModal0(i)}
                                                            judul={`Detail Potong ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* CETAK Section */}
                                                    <button
                                                        onClick={() => openModal(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>CETAK</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.CETAK?.total_defect}
                                                        </label>
                                                    </button>
                                                    {showModal[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModal(i)}
                                                            judul={`Detail Cetak ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* COATING Section */}
                                                    <div
                                                        onClick={() => openModal1(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>COATING</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.COATING?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal1[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal1[i]}
                                                            onClose={() => closeModal1(i)}
                                                            judul={`Detail COATING ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* POND Section */}
                                                    <div
                                                        onClick={() => openModal3(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>POND</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.POND?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal3[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal3[i]}
                                                            onClose={() => closeModal3(i)}
                                                            judul={`Detail POND ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>

                                                                        {data.defectsByKategori?.POND?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* LEM Section */}
                                                    <div
                                                        onClick={() => openModal2(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>LEM</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.LEM?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal2[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal2[i]}
                                                            onClose={() => closeModal2(i)}
                                                            judul={`Detail LEM ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}

                                                    {/* Lipat Section */}
                                                    <div
                                                        onClick={() => openModal4(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>LIPAT</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.LIPAT?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal4[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal4[i]}
                                                            onClose={() => closeModal4(i)}
                                                            judul={`Detail LIPAT ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>

                                                                        {data.defectsByKategori?.LIPAT?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                </div>




                                                <label className='text-sm text-black'>
                                                    {data.total_defect}
                                                </label>
                                            </div>
                                            <div className="w-full overflow-x-auto text-black">
                                                <table className="w-full border-collapse border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-200">
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Waste</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Total Defect</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Kendala</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Defect By Kendala</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.defects
                                                            ?.sort((a: any, b: any) => (a.kode_waste || "").localeCompare(b.kode_waste || ""))
                                                            .map((data2: any, ii: any) => (

                                                                data2.kendala?.length > 0 ? (
                                                                    data2.kendala.map((data3: any, iii: any) => (
                                                                        <tr key={`${ii}-${iii}`} className="border-b border-gray-300">
                                                                            {/* Kode Waste & Total Defect hanya ditampilkan di baris pertama kendala */}
                                                                            {iii === 0 && (
                                                                                <>
                                                                                    <td rowSpan={data2.kendala.length} className="border border-gray-300 px-4 py-2">
                                                                                        {data2.kode_waste} - {data2.waste_desc}
                                                                                    </td>
                                                                                    <td rowSpan={data2.kendala.length} className="border border-gray-300 px-4 py-2">
                                                                                        {data2.total_defect}
                                                                                    </td>
                                                                                </>
                                                                            )}
                                                                            {/* Kendala */}
                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                ✤ {data3.kategori_kendala} - {data3.kode_kendala} - {data3.kendala_desc}
                                                                            </td>
                                                                            {/* Calculated Defect */}
                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                {data3.calculated_defect}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr key={ii} className="border-b border-gray-300">
                                                                        {/* Jika tidak ada kendala, tetap tampilkan kode waste & total defect */}
                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                            {data2.kode_waste} - {data2.waste_desc}
                                                                        </td>
                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                            {data2.total_defect}
                                                                        </td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>
                                                                            -
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>



                                        </div>

                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : activeComponent === 'component2' ? (
                    <>

                        <div className="border-8 border-[#D8EAFF] flex flex-col  h-full bg-white">
                            <label className='justify-center text-black flex w-full text-xl font-bold py-4'>
                                Waste Ke Kendala All
                            </label>
                            <label className='text-xl text-blue-400 font-semibold'>
                                {dateFrom == null ? '' : convertTimeStampToDate(dateFrom)}  ~  {dateTo == null ? '' : convertTimeStampToDate(dateTo)}
                            </label>
                            <div className="w-full overflow-x-auto text-black ">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Waste</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Total Defect</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kategori Kendala</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Kendala</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Deskripsi Kendala</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Defect By Kendala</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waste?.dataWasteAll?.map((data: any, i: any) => (
                                            data.kendala?.length > 0 ? (
                                                data.kendala.map((data2: any, ii: any) => (
                                                    <tr key={`${i}-${ii}`} className="border-b border-gray-300">
                                                        {/* Kode Waste & Total Defect hanya ditampilkan di baris pertama kendala */}
                                                        {ii === 0 && (
                                                            <>
                                                                <td rowSpan={data.kendala.length} className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                                    {data.kode_waste} - {data.waste_desc}
                                                                </td>
                                                                <td rowSpan={data.kendala.length} className="border border-gray-300 px-4 py-2 font-semibold text-center">
                                                                    {data.total_defect}
                                                                </td>
                                                            </>
                                                        )}
                                                        {/* Data Kendala */}
                                                        <td className="border border-gray-300 px-4 py-2  font-bold text-center uppercase">
                                                            {data2.kategori_kendala}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                                            {data2.kode_kendala}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                                            {data2.kendala_desc}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                            {data2.calculated_defect}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr key={i} className="border-b border-gray-300">
                                                    {/* Jika tidak ada kendala, tetap tampilkan kode waste & total defect */}
                                                    <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                        {data.kode_waste} - {data.waste_desc}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                        {data.total_defect}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center" colSpan={4}>
                                                        -
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </div>


                        </div>
                    </>

                ) : activeComponent === 'component3' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">
                            <div className='flex  bg-white py-2 px-2 flex-col'>
                                <label className='justify-center text-black flex w-full text-xl font-bold '>
                                    Kendala Ke Waste By JO
                                </label>
                                <label className='text-xl text-blue-400 font-semibold'>
                                    {dateFrom == null ? '' : convertTimeStampToDate(dateFrom)}  ~  {dateTo == null ? '' : convertTimeStampToDate(dateTo)}
                                </label>
                                <input type="text"
                                    value={searchQuery2}
                                    typeof='search'
                                    onChange={(e) => setSearchQuery2(e.target.value)}
                                    className='border-2 border-stroke rounded-md w-[30%]  px-2 py-1 ' placeholder='Cari Jo, IO, Customer, Produk' />
                            </div>
                            {filteredJo2?.length === 0 && (
                                <div className="text-red-500 text-center font-semibold mt-2">
                                    Data tidak ditemukan
                                </div>
                            )}
                            {filteredJo2?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div key={i} className='rounded-md max-w-screen gap-2 flex flex-col overflow-x-auto text-stone-400 bg-white border-2 border-black'>
                                            {/* Top Content */}
                                            <div
                                                className='grid grid-cols-12 items-center justify-center gap-3 border-b-2 border-stroke pt-2 px-[1%] hover:cursor-pointer'
                                                onClick={() => handleClickDetail(i)} // Trigger detail view on row click
                                            >
                                                <label className='text-sm font-semibold text-black col-span-2'>
                                                    No JO
                                                </label>
                                                <label className='text-sm font-semibold text-black'>
                                                    No IO
                                                </label>
                                                <label className='text-sm font-semibold text-black col-span-2'>
                                                    Customer
                                                </label>
                                                <label className='text-sm font-semibold text-black col-span-3'>
                                                    Produk
                                                </label>
                                                <div className='flex justify-center text-sm font-semibold text-black col-span-3'>
                                                    DEFECT PERPROSES
                                                </div>
                                                <label className='text-sm font-semibold text-black'>
                                                    Total
                                                </label>
                                            </div>

                                            {/* Main Content */}
                                            <div className='grid grid-cols-12 items-center justify-center gap-5 px-[1%]'>
                                                <label className='text-sm text-black col-span-2'>
                                                    {i + 1}. {data.no_jo}
                                                </label>
                                                <label className='text-sm text-black'>
                                                    {data.no_io}
                                                </label>
                                                <label className='text-sm text-black col-span-2'>
                                                    {data.customer}
                                                </label>
                                                <label className='text-sm text-black col-span-3'>
                                                    {data.nama_produk}
                                                </label>


                                                <div className='grid grid-cols-3 col-span-3 gap-2'>
                                                    {/* POTONG Section */}
                                                    <button
                                                        onClick={() => openModal0(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>POTONG</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.POTONG?.total_defect}
                                                        </label>
                                                    </button>
                                                    {showModal0[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal0[i]}
                                                            onClose={() => closeModal0(i)}
                                                            judul={`Detail Potong ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.POTONG?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* CETAK Section */}
                                                    <button
                                                        onClick={() => openModal(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>CETAK</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.CETAK?.total_defect}
                                                        </label>
                                                    </button>
                                                    {showModal[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModal(i)}
                                                            judul={`Detail Cetak ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.CETAK?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* COATING Section */}
                                                    <div
                                                        onClick={() => openModal1(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>COATING</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.COATING?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal1[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal1[i]}
                                                            onClose={() => closeModal1(i)}
                                                            judul={`Detail COATING ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.COATING?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}

                                                    {/* POND Section */}
                                                    <div
                                                        onClick={() => openModal3(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>POND</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.POND?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal3[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal3[i]}
                                                            onClose={() => closeModal3(i)}
                                                            judul={`Detail POND ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.POND?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>

                                                                        {data.defectsByKategori?.POND?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* LEM Section */}
                                                    <div
                                                        onClick={() => openModal2(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>LEM</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.LEM?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal2[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal2[i]}
                                                            onClose={() => closeModal2(i)}
                                                            judul={`Detail LEM ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>
                                                                        {data.defectsByKategori?.LEM?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}

                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                    {/* Lipat Section */}
                                                    <div
                                                        onClick={() => openModal4(i)}
                                                        className='flex flex-col gap-1 hover:cursor-pointer'
                                                    >
                                                        <label className='text-sm text-black'>LIPAT</label>
                                                        <label className='text-sm text-blue-500 font-semibold'>
                                                            {data.defectsByKategori?.LIPAT?.total_defect}
                                                        </label>
                                                    </div>
                                                    {showModal4[i] && (
                                                        <ModalKosongan
                                                            isOpen={showModal4[i]}
                                                            onClose={() => closeModal4(i)}
                                                            judul={`Detail LIPAT ${data.no_jo}`}
                                                        >
                                                            <>
                                                                <div className='grid grid-cols-4 px-4 py-4'>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SORTIR RS
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.sortir_RS?.map((sortir: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sortir.inspektor}
                                                                                </label>
                                                                                {sortir.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            SAMPLING RABUT
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.sampling_rabut?.map((sampling: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {sampling.inspektor}
                                                                                </label>
                                                                                {sampling.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            AMPAR LEM
                                                                        </label>
                                                                        {data.defectsByKategori?.LIPAT?.data?.ampar_lem?.map((ampar: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {ampar.inspektor}
                                                                                </label>
                                                                                {ampar.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}


                                                                    </div>
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className='  text-sm font-semibold text-black'>
                                                                            TEMUAN HELPER
                                                                        </label>

                                                                        {data.defectsByKategori?.LIPAT?.data?.helper?.map((helper: any, i: any) => (
                                                                            <>
                                                                                <label key={i} className='  text-sm  text-black'>
                                                                                    Inspector : {helper.inspektor}
                                                                                </label>
                                                                                {helper.wastes?.map((waste: any, ii: any) => (
                                                                                    <>
                                                                                        <label key={ii} className='  text-sm  text-black'>
                                                                                            {waste.kode_waste} - {waste.waste_desc} : {waste.total_defect}
                                                                                        </label>
                                                                                    </>
                                                                                ))}
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    )}
                                                </div>




                                                <label className='text-sm text-black'>
                                                    {data.total_defect}
                                                </label>
                                            </div>
                                            <div className="w-full overflow-x-auto text-black">
                                                <table className="w-full border-collapse border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-200">
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Kendala</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Total Defect</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Waste</th>
                                                            <th className="border border-gray-300 px-4 py-2 text-left">Defect By Waste</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.defects
                                                            ?.sort((a: any, b: any) => (a.kode_kendala || "").localeCompare(b.kode_kendala || ""))
                                                            .map((data2: any, ii: any) => (

                                                                data2.kendala?.length > 0 ? (
                                                                    data2.kendala.map((data3: any, iii: any) => (
                                                                        <tr key={`${ii}-${iii}`} className="border-b border-gray-300">
                                                                            {iii === 0 && (
                                                                                <>
                                                                                    <td rowSpan={data2.kendala.length} className="border border-gray-300 px-4 py-2">
                                                                                        <span className='font-semibold'>{data2.kategori_kendala}</span> - {data2.kode_kendala} - {data2.kendala_desc}
                                                                                    </td>
                                                                                    <td rowSpan={data2.kendala.length} className="border border-gray-300 px-4 py-2">
                                                                                        {data2.total_defect}
                                                                                    </td>
                                                                                </>
                                                                            )}
                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                ✤ {data3.kode_waste} - {data3.waste_desc}
                                                                            </td>
                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                {data3.calculated_defect}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr key={ii} className="border-b border-gray-300">
                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                            {data2.kode_waste} - {data2.waste_desc}
                                                                        </td>
                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                            {data2.total_defect}
                                                                        </td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>
                                                                            -
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>




                                        </div>

                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : activeComponent === 'component4' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 bg-white">
                            <label className='justify-center text-black flex w-full text-xl font-bold px-2 py-2'>
                                Kendala Ke Waste All
                            </label>
                            <label className='text-xl text-blue-400 font-semibold'>
                                {dateFrom == null ? '' : convertTimeStampToDate(dateFrom)}  ~  {dateTo == null ? '' : convertTimeStampToDate(dateTo)}
                            </label>
                            <div className="w-full overflow-x-auto text-black ">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kategori Kendala</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Kendala</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Total Defect</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Kode Waste</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Deskripsi Waste</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Defect By Waste</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waste?.dataWasteAllReplace?.map((data: any, i: any) => (
                                            data?.kode_waste?.length > 0 ? (
                                                data?.kode_waste?.map((data2: any, ii: any) => (
                                                    <tr key={`${i}-${ii}`} className="border-b border-gray-300">
                                                        {/* Kode Waste & Total Defect hanya ditampilkan di baris pertama kode_waste */}
                                                        {ii === 0 && (
                                                            <>
                                                                <td rowSpan={data.kode_waste?.length} className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                                    {data.kategori_kendala}
                                                                </td>
                                                                <td rowSpan={data.kode_waste?.length} className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                                    {data.kode_kendala} - {data.kendala_desc}
                                                                </td>
                                                                <td rowSpan={data.kode_waste?.length} className="border border-gray-300 px-4 py-2 font-semibold text-center">
                                                                    {data.total_defect}
                                                                </td>
                                                            </>
                                                        )}
                                                        {/* Data Kendala */}

                                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                                            {data2.kode_waste}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                                            {data2.waste_desc}
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                            {data2.total_defect}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr key={i} className="border-b border-gray-300">
                                                    {/* Jika tidak ada kendala, tetap tampilkan kode waste & total defect */}
                                                    <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                        {data.kode_kendala} - {data.kendala_desc}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2  font-semibold text-center">
                                                        {data.total_defect}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center" colSpan={4}>
                                                        -
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </>
                ) : null}

            </div >
        </div >
    )
}

export default RekapWasteQC
