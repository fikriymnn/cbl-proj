import axios from 'axios';
import { MasterMachine } from '../../../types/master';
import { useEffect, useState } from 'react';
import ModalEditSparepartMaster from '../../Modals/ModalEditSparepartMaster';
import ModalTambahUser from '../../Modals/Master/User/ModalTambahUser';
import ModalEditUser from '../../Modals/Master/User/ModalUpdateUserMaster';

const TableUser = () => {

    const [isMobile, setIsMobile] = useState(false);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };
    useEffect(() => {
        handleResize();

        // Event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [user, setuser] = useState<any>();
    useEffect(() => {

        getuser();
    }, []);

    async function getuser() {
        const url = `${import.meta.env.VITE_API_LINK}/users`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setuser(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }


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

    const [showModalTambah, setShowModalTambah] = useState(false);

    const openModalTambah = () => setShowModalTambah(true);
    const closeModalTambah = () => setShowModalTambah(false);

    return (
        <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            {!isMobile && (
                <>
                    <div className='flex w-full justify-between pr-8 border-b border-stroke pb-2'>
                        <input
                            type="search"
                            placeholder="search"
                            name=""
                            id=""
                            className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                        />
                        <button onClick={openModalTambah} className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1'>
                            TAMBAH USER
                        </button>
                        {showModalTambah && (
                            <ModalTambahUser
                                children={undefined}
                                isOpen={showModalTambah}
                                onClose={closeModalTambah}
                                onFinish={getuser} />

                        )}
                    </div>

                    <div className="flex flex-col">

                        <div
                            className='flex border-b border-stroke dark:border-strokedark'


                        >
                            <div className='grid grid-cols-12 w-full px-10'>
                                <div className="justify-start  gap-4 p-2.5 grid col-span-1 ">
                                    <p className="  hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                                        No
                                    </p>
                                </div>
                                <div className="  justify-start p-2.5 grid col-span-2">
                                    <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Nama</p>
                                </div>
                                <div className=" justify-start p-2.5 grid col-span-2">
                                    <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">NIK</p>
                                </div>
                                <div className=" justify-start p-2.5 grid col-span-2">
                                    <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Email</p>
                                </div>

                                <div className="justify-center  p-2.5 grid col-span-2 pl-10">
                                    <p className=" text-[14px] text-slate-600 font-semibold text-center">Role</p>
                                </div>

                            </div>
                        </div>
                        {user != null &&
                            user.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div
                                            className={`flex ${i === user.length - 1
                                                ? ''
                                                : 'border-b border-stroke dark:border-strokedark'
                                                }`}
                                            key={i}
                                        >
                                            <div className='grid grid-cols-12 w-full px-10'>
                                                <div className="justify-start  gap-4 p-2.5 grid ">
                                                    <p className="  hidden text-neutral-500 text-sm font-light dark:text-white sm:block">
                                                        {i + 1}
                                                    </p>
                                                </div>
                                                <div className="  w-2/12 justify-start p-2.5 grid col-span-2">
                                                    <p className="text-neutral-500 text-sm font-light text-center dark:text-white">{data.nama}</p>
                                                </div>
                                                <div className=" justify-start p-2.5 grid col-span-2">
                                                    <p className="text-neutral-500 text-sm font-light text-center dark:text-white">{data.nik}</p>
                                                </div>
                                                <div className="  w-2/12 justify-start p-2.5 grid col-span-3">
                                                    <p className="text-neutral-500 text-sm font-light text-center dark:text-white">{data.email}</p>
                                                </div>

                                                <div className="  text-[14px] w-2/12 justify-start  p-2.5 col-span-2">
                                                    <p className="text-neutral-500 text-sm font-light text-center">{data.role}</p>
                                                </div>

                                                <div className="grid col-span-2 justify-end p-2.5 gap-2">
                                                    <button
                                                        onClick={() => openEdit(i)}
                                                        className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                        EDIT
                                                    </button>
                                                    {showEdit && (
                                                        <ModalEditUser
                                                            children={undefined}
                                                            isOpen={showEdit[i]}
                                                            onClose={() => closeEdit(i)}
                                                            id={data.uuid}
                                                            data={data}
                                                            onFinish={getuser}
                                                        />

                                                    )}
                                                    <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                        DELETE
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    </>
                                );
                            })}

                    </div>
                </>
            )}
            {isMobile && (
                <>
                    <div className='flex w-full justify-between pr-8 border-b border-stroke pb-2'>
                        <input
                            type="search"
                            placeholder="search"
                            name=""
                            id=""
                            className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                        />
                        <button className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1'>
                            TAMBAH USER
                        </button>
                    </div>

                    <div className="flex flex-col w-full ">

                        <div
                            className='flex border-b border-stroke dark:border-strokedark'
                        >
                            <div className='grid grid-cols-8 w-full pl-8'>

                                <div className="  justify-start p-2.5 grid col-span-2">
                                    <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Nama</p>
                                </div>
                                <div className=" justify-start p-2.5 grid col-span-3">
                                    <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Email</p>
                                </div>

                                <div className="justify-center  p-2.5 grid col-span-2 pl-10">
                                    <p className=" text-[14px] text-slate-600 font-semibold text-center">Role</p>
                                </div>
                            </div>
                        </div>
                        {user != null &&
                            user.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div
                                            className={`flex ${i === user.length - 1
                                                ? 'w-full'
                                                : ' px-3 w-full'
                                                }`}
                                            key={i}
                                        >
                                            <div className='grid grid-cols-8 w-full gap-5'>

                                                <div className="   justify-c p-2.5 grid col-span-2">
                                                    <p className="text-neutral-500 text-sm font-light text-center dark:text-white line-clamp-1">{data.nama}</p>
                                                </div>

                                                <div className="   justify-start p-2.5 grid col-span-3">
                                                    <p className="text-neutral-500 text-sm font-light text-center dark:text-white line-clamp-1">{data.email}</p>
                                                </div>

                                                <div className="  text-[14px]  justify-start  p-2.5 col-span-3">
                                                    <p className="text-neutral-500 text-sm font-light text-center line-clamp-1">{data.role}</p>
                                                </div>

                                            </div>


                                        </div>
                                        <div className="flex items-start w-full justify-start p-2.5 gap-2 border-b border-stroke dark:border-strokedark">
                                            <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                EDIT
                                            </button>
                                            <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                DELETE
                                            </button>
                                        </div>
                                    </>
                                );
                            })}
                    </div>
                </>
            )}
        </div>
    );
};

export default TableUser;
