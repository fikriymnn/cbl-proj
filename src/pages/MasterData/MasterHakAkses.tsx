
import DefaultLayout from '../../layout/DefaultLayout'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import ModalXL from '../../components/Tables/PPIC/JadwalProduksi/ModalXL';
function MasterHakAkses() {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setrole] = useState<any>();
    const [roleDetail, setroleDetail] = useState<any>();
    const [namaRole, setnamaRole] = useState<any>();


    useEffect(() => {

        getRole()
    }, []);

    async function getRole() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/role`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,
                {

                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setrole(res.data)
            console.log('role', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function postRole() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/role`;
        try {
            setIsLoading(true)
            const res = await axios.post(
                url,
                {
                    nama_role: namaRole
                },
                {

                    withCredentials: true,
                },
            );
            closeModalTambah()
            getRole()
            alert('Role Berhasil Ditambah')
            setIsLoading(false)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function getRole1(id: any) {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/role/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,
                {

                    withCredentials: true,
                },
            );
            setroleDetail(res.data)
            setIsLoading(false)
            console.log('role Detail', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showModalTambah, setShowModalTambah] = useState(false);

    const openModalTambah = () => setShowModalTambah(true);
    const closeModalTambah = () => setShowModalTambah(false);

    const [showEdit, setShowEdit] = useState<any>([]);
    const openEdit = (i: any, id: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;
        getRole1(id)
        setShowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setShowEdit(onchangeVal);
    };

    return (
        <DefaultLayout>
            <>
                {isLoading && <Loading />}
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px] d'>Master Data &gt; Hak Akses</p>
                <div className="flex w-full bg-white p-2">
                    <div className='flex justify-between w-full'>
                        <div className='my-auto w-full flex justify-end items-end'>
                            <button onClick={openModalTambah} className='w-40 text-xs font-semibold rounded-sm py-1 text-white bg-primary '>ADD ROLE</button>
                            {showModalTambah && (
                                <ModalKosonganSmall
                                    isOpen={showModalTambah}
                                    onClose={closeModalTambah}
                                    judul={'Tambah Role'}>
                                    <>
                                        <div className="flex w-full flex-col py-4 px-4 ">

                                            <label className="text-black text-xs font-bold">
                                                Nama Role
                                            </label>
                                            <div className="flex w-full">
                                                <input
                                                    name="nama_role"
                                                    onChange={(e) => { setnamaRole(e.target.value) }}
                                                    type="text"
                                                    className=" w-full h-8 border-2 border-stroke rounded-md"
                                                />
                                            </div>
                                            <div className="flex w-full pt-3">
                                                <button
                                                    onClick={() => postRole()}
                                                    disabled={isLoading}
                                                    className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                >
                                                    Tambah
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                </ModalKosonganSmall>
                            )}
                        </div>
                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m'>
                    <p className='w-20'>No</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-9'>Role</div>
                        <div className='col-span-3'>


                        </div>

                    </div>
                </div>
                {role?.map((data: any, i: any) => (
                    <>
                        <div
                            key={i}
                            className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m'>
                            <p className='w-20'>{i + 1}</p>
                            <div className='grid grid-cols-12 w-full'>
                                <div className='col-span-9'>{data.nama_role}</div>
                                <div className='col-span-3'>
                                    <button
                                        onClick={() => openEdit(i, data.id)}
                                        className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Hak Akses
                                    </button>
                                    {showEdit[i] == true && (

                                        <ModalXL
                                            isOpen={showEdit[i]}
                                            onClose={() => closeEdit(i)}
                                            judul={'Hak Akses'}
                                        >
                                            <>
                                                <div className=' grid  bg-white py-2 w-full'>
                                                    {roleDetail?.data?.akses?.map((data2: any, ii: any) => (

                                                        <>
                                                            <div
                                                                key={ii}
                                                                className=' grid grid-cols-12 bg-white py-2 w-full border-b-2 border-stroke gap-1'>
                                                                <div className='flex col-span-2 items-center gap-2'>
                                                                    <p>
                                                                        {data2.bagian}
                                                                    </p>
                                                                    <input
                                                                        checked={data2.is_active}
                                                                        type="checkbox" />
                                                                </div>
                                                            </div>
                                                            <div className='grid grid-cols-12 border-b-2 border-stroke gap-2'>
                                                                <div className='col-span-2'>

                                                                </div>
                                                                {data2.parent_1?.map((data3: any, iii: any) => (

                                                                    <>
                                                                        <div
                                                                            key={iii}
                                                                            className='  col-span-2 bg-white py-2 w-full  gap-1 flex-col'>
                                                                            <div className='flex col-span-2 items-center gap-2'>
                                                                                <p>
                                                                                    Dashboard {data3.nama}
                                                                                </p>
                                                                                <input
                                                                                    checked={data3.is_active}
                                                                                    type="checkbox" />
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-12 col-span-8 border-b-2 border-stroke'>
                                                                            {data3.parent_2?.map((data4: any, iiii: any) => (

                                                                                <>
                                                                                    <div
                                                                                        key={iiii}
                                                                                        className='flex flex-col col-span-8 bg-white py-2 w-full gap-1'>
                                                                                        <div className='flex col-span-2 items-center gap-2 justify-between'>
                                                                                            <p>
                                                                                                {data4.nama}
                                                                                            </p>
                                                                                            {data4.is_main == false && (
                                                                                                <input
                                                                                                    checked={data4.is_active}
                                                                                                    type="checkbox" />
                                                                                            )}


                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='grid grid-cols-12 col-span-8 '>
                                                                                        <>
                                                                                            {data4.parent_3?.map((data5: any, iiiii: any) => (
                                                                                                <>
                                                                                                    <div
                                                                                                        key={iiiii}
                                                                                                        className='flex flex-col col-span-8 bg-white py-2 w-full gap-1'>
                                                                                                        <div className='flex col-span-2 items-center gap-2 justify-between'>
                                                                                                            <p>
                                                                                                                {data5.nama}
                                                                                                            </p>

                                                                                                            <input
                                                                                                                checked={data5.is_active}
                                                                                                                type="checkbox" />
                                                                                                        </div>
                                                                                                    </div>


                                                                                                    <div className='grid grid-cols-12 col-span-8 '>

                                                                                                        {data5.parent_4?.map((data6: any, iiiiii: any) => (
                                                                                                            <div
                                                                                                                key={iiiiii}
                                                                                                                className='flex flex-col col-span-8 bg-white py-2 w-full gap-1'>

                                                                                                                <div className='flex col-span-2 items-center gap-2 justify-between'>
                                                                                                                    <p>
                                                                                                                        - {data6.nama}
                                                                                                                    </p>

                                                                                                                    <input
                                                                                                                        checked={data6.is_active}
                                                                                                                        type="checkbox" />
                                                                                                                </div>
                                                                                                            </div>

                                                                                                        ))}


                                                                                                    </div >
                                                                                                </>
                                                                                            ))}
                                                                                        </>

                                                                                    </div>
                                                                                </>

                                                                            ))}
                                                                        </div>

                                                                    </>

                                                                ))}
                                                            </div>
                                                        </>

                                                    ))}
                                                </div>
                                            </>
                                        </ModalXL>
                                    )}

                                </div>
                            </div>
                        </div >
                    </>
                ))}


            </>
        </DefaultLayout >
    )
}

export default MasterHakAkses