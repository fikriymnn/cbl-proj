import React, { useState } from 'react'
import ModalXL from './ModalXL';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

function ListJOProduksi() {

    const mesin = [
        {
            nama: 'R700',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',

        },
        {
            nama: 'SM74',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',
        },
        {
            nama: 'GTO',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',
        },
        {
            nama: 'Manual 1',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',
        },
        {
            nama: 'Manual 2',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',
        },
        {
            nama: 'Manual 3',
            druk: '123.456',
            jam8: 'JO-0001',
            jam9: 'JO-0001',
            jam10: 'JO-0001',
            jam11: 'JO-0001',
        },
    ];
    const listJo = [
        {
            noJo: 'JO-24-00818',
            namaItem: 'Dus Paracetamol 200ml',
            qtyJo: '10.000',
            qtyDruk: '1000',
            tglKirim: '1-Januari-2025'

        },
        {
            noJo: 'JO-24-00819',
            namaItem: 'Dus Vitamin 200ml',
            qtyJo: '11.000',
            qtyDruk: '1100',
            tglKirim: '10-Januari-2025'

        },
        {
            noJo: 'JO-24-00820',
            namaItem: 'Dus Mineral 200ml',
            qtyJo: '12.000',
            qtyDruk: '1200',
            tglKirim: '20-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },

        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
        {
            noJo: 'JO-24-00821',
            namaItem: 'Dus Besi 200ml',
            qtyJo: '13.000',
            qtyDruk: '1400',
            tglKirim: '30-Januari-2025'

        },
    ]

    const [activeComponent, setActiveComponent] = useState('component1');

    const showComponent1 = () => {
        setActiveComponent('component1');
    };

    const showComponent2 = () => {
        setActiveComponent('component2');
    };

    const [showListJo, setShowListJo] = useState(false);
    const openModalListJo = () => setShowListJo(true);
    const closeModalListJo = () => setShowListJo(false);


    const [showCalculate, setShowCalculate] = useState<any>([]);
    const openCalculate = (i: any) => {
        const onchangeVal: any = [...showCalculate];
        onchangeVal[i] = true;

        setShowCalculate(onchangeVal);
    };
    const closeCalculate = (i: any) => {
        const onchangeVal: any = [...showCalculate];
        onchangeVal[i] = false;

        setShowCalculate(onchangeVal);
    };
    return (
        <main className="overflow-x-scroll ' ">
            <div className="min-w-[700px]  bg-[#D8EAFF] rounded-xl flex gap-1 ">
                {activeComponent === 'component1' ? (
                    <>
                        <div className='flex w-[97%] flex-col bg-[#D8EAFF]'>
                            <div className="grid grid-cols-10 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0  rounded-md bg-[#D8EAFF] mb-2">
                                <div className='col-span-8 gap-2 flex flex-col'>
                                    <p className="my-auto text-sm text-primary font-semibold">
                                        Pilih Tanggal
                                    </p>
                                    <div className="flex md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                        <p className="text-sm text-primary font-semibold ">
                                            Dari :
                                        </p>

                                        <input
                                            className='rounded-md bg-white px-2'
                                            type="date"

                                        ></input>

                                    </div>
                                    <div className="flex  md:max-w-[30%] max-w-[60%] gap-2 justify-between">
                                        <p className="text-sm text-primary font-semibold ">
                                            Sampai :
                                        </p>

                                        <input
                                            className='rounded-md bg-white px-2'
                                            type="date"

                                        ></input>

                                    </div>
                                </div>
                                <div className="flex justify-end col-span-2">
                                    <button
                                        onClick={() => openModalListJo()}
                                        className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                    >
                                        Booking
                                    </button>
                                    {showListJo == true && (
                                        <>
                                            <ModalKosonganSmall
                                                isOpen={showListJo}
                                                onClose={() => closeModalListJo()}
                                                judul={'Booking'}
                                            >
                                                <>
                                                    <div className="grid grid-cols-12 w-full md:gap-4 gap-1  px-4 py-4 md:mt-0   bg-white mb-2 ">
                                                        <div className='gap-2 col-span-8 flex flex-col'>
                                                            <p className="my-auto text-sm text-primary font-semibold">
                                                                Pilih Tanggal
                                                            </p>
                                                            <div className="flex w-full gap-2 justify-between">
                                                                <p className="text-sm text-primary font-semibold ">
                                                                    Dari :
                                                                </p>

                                                                <input
                                                                    className='rounded-md bg-blue-200 px-2'
                                                                    type="date"

                                                                ></input>

                                                            </div>
                                                            <div className="flex w-full   gap-2 justify-between">
                                                                <p className="text-sm text-primary font-semibold ">
                                                                    Sampai :
                                                                </p>

                                                                <input
                                                                    className='rounded-md bg-blue-200 px-2'
                                                                    type="date"

                                                                ></input>

                                                            </div>
                                                        </div>

                                                    </div>
                                                </>
                                            </ModalKosonganSmall>
                                        </>
                                    )
                                    }
                                </div>
                            </div>


                            <div className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                <p className='text-[#646464] text-xs font-bold col-span-2'>
                                    Job Order
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-3'>
                                    Nama Item
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    Qty Jo
                                </p>
                                <p className='text-[#646464] text-xs font-bold '>
                                    Qty Druk
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-5'>
                                    Tanggal Kirim
                                </p>

                            </div>
                            {listJo?.map((data: any, i: number) => (
                                <>
                                    <div className='grid grid-cols-12  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                        <p className='text-[#646464] text-sm  col-span-2'>
                                            {data.noJo}
                                        </p>
                                        <p className='text-[#646464] text-sm  col-span-3'>
                                            {data.namaItem}
                                        </p>
                                        <p className='text-[#646464] text-sm  '>
                                            {data.qtyJo}
                                        </p>
                                        <p className='text-[#646464] text-sm  '>
                                            {data.qtyDruk}
                                        </p>
                                        <p className='text-[#646464] text-sm  col-span-3'>
                                            {data.tglKirim}
                                        </p>
                                        <p className='text-[#0065de] text-sm  font-bold'>
                                            CALCULATE
                                        </p>
                                    </div>
                                </>
                            ))}
                        </div>
                        <div
                            onClick={showComponent2}
                            className='flex w-[3%] hover:cursor-pointer bg-blue-600 rounded-l-lg max-h-[20%] flex-col text-xl font-extrabold text-white items-center justify-center'>
                            {'<'}
                        </div>

                    </>
                ) :
                    (
                        <>
                            <div
                                onClick={showComponent1}
                                className='flex w-[3%] hover:cursor-pointer bg-blue-600 rounded-l-lg max-h-[20%] flex-col text-xl font-extrabold text-white items-center justify-center'>
                                {'>'}
                            </div>
                            <div className='flex w-[97%] flex-col bg-[#D8EAFF]'>
                                <div className='flex gap-2 w-full border-b-8 border-[#D8EAFF] bg-[#D8EAFF]'>
                                    {mesin?.map((data: any) => (
                                        <>
                                            <div className='flex flex-col w-40  justify-center items-center bg-white rounded-md py-4'>
                                                <p className='text-center text-[#0065de] text-base font-semibold'>
                                                    {data.nama}
                                                </p>
                                                <p className='text-center text-black text-2xl font-light'>
                                                    {data.druk}
                                                </p>
                                            </div>
                                        </>
                                    ))}
                                </div>
                                <div className='flex  bg-white  border-b-8 border-[#D8EAFF]'>
                                    <p className='text-center text-[#0065de] text-[11px] w-[6%] font-semibold py-[1%] '>
                                        TIME
                                    </p>
                                    {mesin?.map((data: any, i: number) => (
                                        <>
                                            <div
                                                key={i}
                                                className={`flex w-[6%] justify-center items-center ${i % 2 === 1 ? 'bg-white   ' : 'bg-[#eaf4ff]'}`}>
                                                <p className='text-center text-[#0065de] text-[11px]  font-semibold'>
                                                    {data.nama}
                                                </p>
                                            </div >
                                        </>
                                    ))}
                                </div>
                                <div className='flex w-full bg-white  border-b-8 border-[#D8EAFF] flex-col '>

                                    {mesin?.map((data: any, i: number) => (
                                        <>
                                            <div className='flex border-b-8 border-[#D8EAFF]'>
                                                <div
                                                    key={i}
                                                    className={`flex w-[6%] py-[1%] justify-center items-center `}>
                                                    <p className='text-center text-[#0065de] text-[11px]  font-semibold'>
                                                        JAM {8 + i}
                                                    </p>
                                                </div >
                                                <div
                                                    key={i}
                                                    className={`flex w-[6%] justify-center items-center bg-[#eaf4ff]`}>
                                                    <p className='text-center text-[#0065de] text-[11px]  font-semibold'>
                                                        {data.jam8}
                                                    </p>
                                                </div >
                                            </div>
                                        </>
                                    ))}
                                </div>
                            </div>

                        </>
                    )
                }
            </div>

        </main >
    )
}

export default ListJOProduksi
