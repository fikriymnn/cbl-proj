import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

function RekapWasteQC() {
    const [isLoading, setIsLoading] = useState(false);
    const [waste, setWaste] = useState<any>();
    const [dateFrom, setDateFrom] = useState<any>();
    const [dateTo, setDateTo] = useState<any>();

    const [wasteMaster, setWasteMaster] = useState<any>();


    useEffect(() => {
        getWaste(null, null)
        getWasteMaster()
    }, []);

    async function getWaste(dateFrom1: any, dateTo1: any) {
        const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`;
        const url = `${import.meta.env.VITE_API_LINK}/reportWaste`;
        try {
            setIsLoading(true)
            const res2 = await axios.get(url2, {
                params: {
                    first_date: dateFrom1,
                    last_date: dateFrom1,
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
            console.log('waste', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log('getwaste', error);
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
            console.log('getmaster', error);
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

    const [showDetailByKendala, setShowDetailByKendala] = useState<any>(false)

    const OpenDetailByKendala = () => {

        setShowDetailByKendala(true);
    };
    const CloseDetailByKendala = () => {

        setShowDetailByKendala(false);
    };

    const [showDetailByMesin, setShowDetailByMesin] = useState<any>(false)

    const OpenDetailByMesin = () => {

        setShowDetailByMesin(true);
    };
    const CloseDetailByMesin = () => {

        setShowDetailByMesin(false);
    };
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
                </div>
                <div className='flex gap-3 w-full justify-center'>
                    <div className='flex flex-col gap-2 border-2 w-[35%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Waste Ke Kendala.
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
                    <div className='flex flex-col gap-2 border-2 w-[35%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Kendala Ke Waste.
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button onClick={showComponent3} className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste By JO
                            </button>
                            <button onClick={showComponent4} className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Waste All
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 border-2 w-[35%] justify-center border-white rounded-md'>
                        <label className='text-center justify-center  flex text-xl font-bold text-black px-[1%] '>
                            Detail Kendala
                        </label>
                        <div className='flex gap-2 justify-center'>
                            <button
                                onClick={OpenDetailByKendala}
                                className='bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Kategori
                            </button>
                            <button
                                onClick={OpenDetailByMesin}
                                className='bg-blue-400 w-[50%]  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                Mesin
                            </button>
                        </div>
                    </div>
                </div>
                {showDetailByKendala == true && (
                    <>
                        <ModalKosonganSmall
                            isOpen={showDetailByKendala}
                            onClose={() => CloseDetailByKendala()}
                            judul={'Detail By Kendala'}
                        >
                            <>
                                <div className='grid grid-cols-2 gap-2 px-5 pt-4'>
                                    <div className='flex flex-col'>
                                        <label className='flex text-sm font-bold text-black'>
                                            Kendala
                                        </label>
                                    </div>
                                    <div className='flex flex-col'>
                                        <label className='flex text-sm font-bold text-black'>
                                            Qty
                                        </label>
                                    </div>
                                </div>
                                <div className='grid grid-cols-2  px-5 pb-4'>

                                    {waste?.dataByKategori?.dataKendala?.map((kendala: any, i: any) => (
                                        <>
                                            <label className='flex text-sm  text-black'>
                                                {kendala.kategori_kendala}
                                            </label>
                                            <label className='flex text-sm  text-black'>
                                                {kendala.total_calculated_defect}
                                            </label>
                                        </>
                                    ))}


                                </div>
                            </>
                        </ModalKosonganSmall>
                    </>
                )}
                {showDetailByMesin == true && (
                    <>
                        <ModalKosonganSmall
                            isOpen={showDetailByMesin}
                            onClose={() => CloseDetailByMesin()}
                            judul={'Detail By Mesin'}
                        >
                            <>
                                <div className='grid grid-cols-2 gap-2 px-5 pt-4'>
                                    <div className='flex flex-col'>
                                        <label className='flex text-sm font-bold text-black'>
                                            Mesin
                                        </label>
                                    </div>
                                    <div className='flex flex-col'>
                                        <label className='flex text-sm font-bold text-black'>
                                            Qty
                                        </label>
                                    </div>
                                </div>
                                <div className='grid grid-cols-2  px-5 pb-4'>

                                    {waste?.dataByKategori?.dataKendalaMesin?.map((kendala: any, i: any) => (
                                        <>
                                            <label className='flex text-sm  text-black'>
                                                {kendala.mesin}
                                            </label>
                                            <label className='flex text-sm  text-black'>
                                                {kendala.total_calculated_defect}
                                            </label>
                                        </>
                                    ))}


                                </div>
                            </>
                        </ModalKosonganSmall>
                    </>
                )}
                {activeComponent === 'component1' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">

                            {waste?.dataWasteByJo?.map((data: any, i: any) => {
                                return (
                                    <>

                                        <div key={i} className=' rounded-md  max-w-screen gap-2 flex flex-col  overflow-x-scroll text-stone-400 bg-white  border-2 border-black'>
                                            <div className='grid grid-cols-12 items-center justify-center gap-3 border-b-2 border-stroke pt-2 px-[1%]'>

                                                <label className='  text-sm font-semibold text-black col-span-2'>
                                                    No JO
                                                </label>
                                                <label className='  text-sm font-semibold text-black '>
                                                    No IO
                                                </label>
                                                <label className='  text-sm font-semibold text-black'>
                                                    Customer
                                                </label>
                                                <label className='  text-sm font-semibold text-black'>
                                                    Produk
                                                </label>
                                                <div className='flex justify-center text-sm font-semibold text-black col-span-4'>
                                                    DEFECT PERPROSES
                                                </div>
                                                <label className=' text-sm font-semibold text-black'>
                                                    Total
                                                </label>

                                                <div className='flex  justify-end'>

                                                </div>
                                            </div>
                                            <div className='grid grid-cols-12  items-center justify-center gap-3 px-[1%]'>

                                                <label className='  text-sm  text-black  col-span-2'>
                                                    {i + 1}. {data.no_jo}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.no_io}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.customer}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.nama_produk}
                                                </label>
                                                <button
                                                    onClick={() => openModal(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        CETAK
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.CETAK?.total_defect}
                                                    </label>
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div
                                                    onClick={() => openModal1(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        COATING
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.COATING?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal1[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div onClick={() => openModal2(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        LEM
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.LEM?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal2[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div onClick={() => openModal3(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        POND
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.POND?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal3[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <label className=' text-sm  text-black'>
                                                    {data.total_defect}
                                                </label>
                                            </div>
                                            <div className='flex flex-col w-full h-full'>
                                                <button
                                                    title='button'
                                                    onClick={() => handleClickDetail(i)}
                                                    className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center h-full "
                                                >
                                                    <img src={Arrow} alt="" className="mx-2" />
                                                </button>
                                            </div>
                                            {showDetail[i] && (
                                                <>
                                                    <div className=' flex flex-col gap-1 '>
                                                        {data.defects?.map((data2: any, ii: any) => {
                                                            return (
                                                                <>
                                                                    <div
                                                                        key={ii}
                                                                        className='flex w-full flex-col border-b-8 border-[#D8EAFF] px-[1%] py-[1%] gap-2'>
                                                                        <div
                                                                            className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                                        >

                                                                            <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                {data2.kode_waste} - {data2.waste_desc}
                                                                            </label>
                                                                            <label className='text-xs text-red-500 font-semibold '>
                                                                                {data2.total_defect}
                                                                            </label>

                                                                        </div>
                                                                        <div className='flex w-full gap-1 '>
                                                                            {data2.kendala?.map((data3: any, iii: any) => {
                                                                                return (
                                                                                    <>
                                                                                        <div
                                                                                            key={iii}
                                                                                            className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                                        >
                                                                                            <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                                                {data3.kategori_kendala}
                                                                                            </label>
                                                                                            <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black'>
                                                                                                {data3.kode_kendala} - {data3.kendala_desc}
                                                                                            </label>
                                                                                            <label className='text-xs text-red-500 font-semibold '>
                                                                                                {data3.calculated_defect}
                                                                                            </label>

                                                                                        </div>
                                                                                    </>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                </>
                                                            )
                                                        })}
                                                    </div>
                                                </>
                                            )}

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

                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 h-full ">
                            {waste?.dataWasteAll?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className=''>
                                            <div className=' rounded-md  max-w-screen gap-2 flex overflow-x-scroll items-center  text-stone-400 bg-white  border-2 border-black px-[4%]'>

                                                <div
                                                    className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                >

                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                        {data.kode_waste} - {data.waste_desc}
                                                    </label>
                                                    <label className='text-xs text-red-500 font-semibold '>
                                                        {data.total_defect}
                                                    </label>

                                                </div>
                                                <div className=' flex pt-3 gap-3'>
                                                    {data.kendala?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div
                                                                    key={ii}
                                                                    className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                >
                                                                    <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                        {data2.kategori_kendala}
                                                                    </label>
                                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black'>
                                                                        {data2.kode_kendala} - {data2.kendala_desc}
                                                                    </label>
                                                                    <label className='text-xs text-red-500 font-semibold '>
                                                                        {data2.calculated_defect}
                                                                    </label>
                                                                    <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                        {data2.operator}
                                                                    </label>
                                                                    <label className='text-xs font-bold border-b-2 h-full w-full text-center text-black border-black uppercase bg-slate-200'>
                                                                        {data2.kategori}
                                                                    </label>
                                                                </div>
                                                            </>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                        </div>


                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>

                ) : activeComponent === 'component3' ? (
                    <>
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">

                            {waste?.dataWasteByJoReplace?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div key={i} className=' rounded-md  max-w-screen gap-2 flex flex-col  overflow-x-scroll text-stone-400 bg-white  border-2 border-black'>
                                            <div className='grid grid-cols-12 items-center justify-center gap-3 border-b-2 border-stroke pt-2 px-[1%]'>

                                                <label className='  text-sm font-semibold text-black col-span-2'>
                                                    No JO
                                                </label>
                                                <label className='  text-sm font-semibold text-black '>
                                                    No IO
                                                </label>
                                                <label className='  text-sm font-semibold text-black'>
                                                    Customer
                                                </label>
                                                <label className='  text-sm font-semibold text-black'>
                                                    Produk
                                                </label>
                                                <div className='flex justify-center text-sm font-semibold text-black col-span-4'>
                                                    DEFECT PERPROSES
                                                </div>
                                                <label className=' text-sm font-semibold text-black'>
                                                    Total
                                                </label>

                                                <div className='flex  justify-end'>

                                                </div>
                                            </div>
                                            <div className='grid grid-cols-12  items-center justify-center gap-3 px-[1%]'>

                                                <label className='  text-sm  text-black  col-span-2'>
                                                    {i + 1}. {data.no_jo}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.no_io}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.customer}
                                                </label>
                                                <label className='  text-sm  text-black'>
                                                    {data.nama_produk}
                                                </label>
                                                <button
                                                    onClick={() => openModal(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        CETAK
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.CETAK?.total_defect}
                                                    </label>
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div
                                                    onClick={() => openModal1(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        COATING
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.COATING?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal1[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div onClick={() => openModal2(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        LEM
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.LEM?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal2[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <div onClick={() => openModal3(i)}
                                                    className='flex flex-col gap-1 hover:cursor-pointer'>
                                                    <label className='  text-sm  text-black'>
                                                        POND
                                                    </label>
                                                    <label className='  text-sm  text-blue-500 font-semibold'>
                                                        {data.defectsByKategori?.POND?.total_defect}
                                                    </label>
                                                </div>
                                                {showModal3[i] == true && (
                                                    <>
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


                                                                    </div>
                                                                </div>
                                                            </>
                                                        </ModalKosongan>
                                                    </>
                                                )}
                                                <label className=' text-sm  text-black'>
                                                    {data.total_defect}
                                                </label>
                                            </div>
                                            <div className='flex flex-col w-full h-full'>
                                                <button
                                                    title='button'
                                                    onClick={() => handleClickDetail(i)}
                                                    className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md flex justify-center h-full "
                                                >
                                                    <img src={Arrow} alt="" className="mx-2" />
                                                </button>
                                            </div>

                                            {showDetail[i] && (
                                                <>
                                                    <div className=' flex flex-col gap-1 '>
                                                        {data.defects?.map((data2: any, ii: any) => {
                                                            return (
                                                                <>
                                                                    <div
                                                                        key={ii}
                                                                        className='flex w-full flex-col border-b-8 border-[#D8EAFF] px-[1%] py-[1%] gap-2'>
                                                                        <div
                                                                            className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                                        >

                                                                            <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                {data2.kode_kendala} - {data2.kendala_desc}
                                                                            </label>
                                                                            <label className='text-xs text-red-500 font-semibold '>
                                                                                {data2.total_defect}
                                                                            </label>

                                                                        </div>
                                                                        <div className='flex w-full gap-1 '>
                                                                            {data2.kendala?.map((data3: any, iii: any) => {
                                                                                return (
                                                                                    <>
                                                                                        <div
                                                                                            key={iii}
                                                                                            className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                                        >

                                                                                            <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                                                {data3.kode_waste} - {data3.waste_desc}
                                                                                            </label>
                                                                                            <label className='text-xs text-red-500 font-semibold '>
                                                                                                {data3.calculated_defect}
                                                                                            </label>

                                                                                        </div>
                                                                                    </>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                </>
                                                            )
                                                        })}
                                                    </div>
                                                </>
                                            )}

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
                        <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 ">
                            {waste?.dataWasteAllReplace?.map((data: any, i: any) => {
                                return (
                                    <>
                                        <div
                                            key={i} className=''>
                                            <div className=' rounded-md  max-w-screen pt-4 gap-2 flex overflow-x-scroll items-center  text-stone-400 bg-white  border-2 border-black px-[4%]'>

                                                <div
                                                    className='flex flex-col justify-between gap-2 border-2 border-black  w-30 items-center rounded-md'
                                                >

                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                        {data.kode_kendala} - {data.kendala_desc}
                                                    </label>
                                                    <label className='text-xs text-red-500 font-semibold '>
                                                        {data.total_defect}
                                                    </label>

                                                </div>
                                                <div className=' flex  gap-3'>
                                                    {data.kode_waste?.map((data2: any, ii: any) => {
                                                        return (
                                                            <>
                                                                <div
                                                                    key={ii}
                                                                    className='flex flex-col justify-between gap-2 border-2 border-black   w-30 items-center rounded-md'
                                                                >

                                                                    <label className='text-xs font-semibold border-b-2 h-full w-full text-center text-black border-black bg-slate-200'>
                                                                        {data2.kode_waste} - {data2.waste_desc}
                                                                    </label>
                                                                    <label className='text-xs text-red-500 font-semibold '>
                                                                        {data2.total_defect}
                                                                    </label>

                                                                </div>
                                                            </>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                        </div>


                                    </>
                                )
                            }
                            )
                            }

                        </div>
                    </>
                ) : null}

            </div >
        </div >
    )
}

export default RekapWasteQC
