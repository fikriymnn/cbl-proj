import axios from 'axios';
import React, { useEffect, useState } from 'react'
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../../Loading';

function DefectPond() {

    const [isLoading, setIsLoading] = useState(false);

    const [addDefect, setDefect] = useState<any>();
    useEffect(() => {

        getDefect();
    }, []);

    async function getDefect() {
        const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond`;
        try {
            const res = await axios.get(url,
                {
                    params: {
                        status: 'active'
                    },
                    withCredentials: true,
                });

            setDefect(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const [kode, setKode] = useState<any>();
    const [masalah, setMasalah] = useState<any>();

    async function tambahDefect() {
        const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond`;
        try {
            setIsLoading(true);
            const res = await axios.post(url,
                {
                    kode: kode,
                    masalah: masalah,
                },
                {
                    withCredentials: true,
                });

            getDefect();
            setIsLoading(false);
            closeModalTambah();
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function editDefect(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond/${id}`;
        try {
            setIsLoading(true);
            const res = await axios.put(url,
                {
                    kode: kode,
                    masalah: masalah,
                },
                {
                    withCredentials: true,
                });

            getDefect();
            setIsLoading(false);
        } catch (error: any) {
            console.log(error);
        }
    }
    async function deleteDefect(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond/${id}`;
        try {
            setIsLoading(true);
            const res = await axios.delete(
                url,

                {
                    withCredentials: true,
                },
            );
            getDefect();
            setIsLoading(false);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [showModalTambah, setShowModalTambah] = useState(false);

    const openModalTambah = () => setShowModalTambah(true);
    const closeModalTambah = () => setShowModalTambah(false);

    const [showEdit, setShowEdit] = useState<any>([]);

    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setShowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setShowEdit(onchangeVal);
    };

    const [showDelete, setShowDelete] = useState<any>([]);

    const openDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = true;

        setShowDelete(onchangeVal);
    };
    const closeDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = false;

        setShowDelete(onchangeVal);
    };
    return (

        <>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m'>
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-2'>Kode</div>
                    <div className='col-span-3'>Masalah</div>
                    <div className='col-span-7 flex gap-3 justify-end'>
                        <button onClick={openModalTambah} className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1'>
                            TAMBAH
                        </button>
                        {showModalTambah && (
                            <ModalAddPeriode

                                isOpen={showModalTambah}
                                onClose={closeModalTambah}
                                judul={'Tambah Defect'}                             >
                                <div className='px-2 flex flex-col'>
                                    <label className="text-black text-sm font-bold pt-4">Kode</label>
                                    <input
                                        onChange={(e) => setKode(e.target.value)}
                                        type="text"
                                        className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                    />
                                    <label className="text-black text-sm font-bold pt-4">Masalah</label>
                                    <input
                                        onChange={(e) => setMasalah(e.target.value)}
                                        type="text"
                                        className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                    />

                                    <div className="pt-4">
                                        <button
                                            disabled={isLoading}
                                            onClick={tambahDefect}
                                            className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                        >
                                            {isLoading ? 'Loading...' : 'TAMBAH DEFECT'}
                                        </button>
                                        {isLoading && <Loading />}
                                    </div>
                                </div>
                            </ModalAddPeriode>

                        )}
                    </div>

                </div>
            </div>
            {addDefect != null &&
                addDefect?.map((data: any, i: number) => {
                    return (
                        <>
                            <div className=' flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium border-b-3 border-[#D8EAFF]'>
                                <p className='w-20'>{i + 1}</p>
                                <div className='grid grid-cols-12 w-full'>
                                    <div className='col-span-2'>{data?.kode}</div>
                                    <div className='col-span-3'>{data?.masalah}</div>
                                    <div className='col-span-7 flex gap-3 justify-end'>
                                        <button
                                            onClick={() => openEdit(i)}
                                            className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                            EDIT
                                        </button>
                                        {showEdit && (
                                            <ModalAddPeriode
                                                isOpen={showEdit[i]}
                                                onClose={() => closeEdit(i)}
                                                judul={'Edit Defect'}
                                            >
                                                <div className='px-2 flex flex-col'>
                                                    <label className="text-black text-sm font-bold pt-4">Kode</label>
                                                    <input
                                                        defaultValue={data?.kode}
                                                        onChange={(e) => setKode(e.target.value)}
                                                        type="text"
                                                        className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                    />
                                                    <label className="text-black text-sm font-bold pt-4">Masalah</label>
                                                    <input
                                                        defaultValue={data?.masalah}
                                                        onChange={(e) => setMasalah(e.target.value)}
                                                        type="text"
                                                        className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                    />

                                                    <div className="pt-4">
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => editDefect(data?.id)}
                                                            className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                                        >
                                                            {isLoading ? 'Loading...' : 'EDIT DEFECT'}
                                                        </button>
                                                        {isLoading && <Loading />}
                                                    </div>
                                                </div>
                                            </ModalAddPeriode>

                                        )}
                                        <button
                                            onClick={() => openDelete(i)}
                                            className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                            DELETE
                                        </button>
                                        {showDelete[i] == true && (
                                            <ModalAddPeriode
                                                isOpen={showDelete[i]}
                                                onClose={() => closeDelete(i)}
                                                judul={"Hapus Defect"}
                                            >
                                                <div>
                                                    <div className="pt-4">
                                                        {/* {data?.id} */}
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => deleteDefect(data?.id)}
                                                            className="rounded-md justify-center items-center w-full h-10 bg-red-600 text-white font-semibold text-sm"
                                                        >
                                                            {isLoading ? 'Loading...' : 'DELETE DEFECT'}
                                                        </button>
                                                        {isLoading && <Loading />}
                                                    </div>
                                                </div>
                                            </ModalAddPeriode>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </>
                    );
                })}



        </>

    )
}

export default DefectPond