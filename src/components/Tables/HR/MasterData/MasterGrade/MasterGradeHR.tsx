import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Loading from '../../../../Loading';
import formatInteger from '../../../../../utils/formaterInteger';

function IsiMasterGrade() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getGrade();
        getGradeIsi()
    }, []);


    const [grade, setGrade] = useState<any>();
    const [newGradeIsi, setNewGradeIsi] = useState<any>();

    async function getGrade() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/grade`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setGrade(res.data)

            console.log('grade', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [grade1, setGrade1] = useState<any>();

    async function getGrade1(id: any) {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/grade/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setGrade1(res.data)
            console.log('grade 1', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [gradeIsi, setGradeIsi] = useState<any>();
    async function getGradeIsi() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/gradeColumn`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setGradeIsi(res.data)
            console.log('GRADE ISI', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [kategori, setKategori] = useState<any>();

    async function postMasterMesin() {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    kategori: kategori,
                    grade_isi: newGradeIsi
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();
            getGrade()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
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

    const handleInputChange = (index: any, event: any) => {
        const newGradeIsi = [...gradeIsi.data];
        newGradeIsi[index][event.target.name] = event.target.value;
        setNewGradeIsi(newGradeIsi);
    };

    const [kategoriEdit, setKategoriEdit] = useState<any>();
    const [newGradeIsiEdit, setNewGradeIsiEdit] = useState<any>();

    async function editMasterMesin(id: any) {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    kategori: kategoriEdit,
                    grade_isi: newGradeIsiEdit
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();
            getGrade()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const handleInputChangeEdit = (index: any, event: any) => {
        const newGradeIsi = [...grade1.isi_grade];
        newGradeIsi[index][event.target.name] = event.target.value;
        setNewGradeIsiEdit(newGradeIsi);
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
        <div>
            <>
                <main className="overflow-x-scroll">
                    {isLoading && <Loading />}

                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className='flex w-full  pr-8 border-b-8 border-[#D8EAFF] pb-2'>
                            <div className='px-2 py-1 flex w-full justify-end items-center'>
                                <button
                                    onClick={() => openModalHistory()}
                                    className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2'>
                                    TAMBAH GRADE
                                </button>
                                {showHistory == true && (
                                    <>
                                        <ModalKosonganSmall
                                            isOpen={showHistory}
                                            onClose={() => closeModalHistory()}
                                            judul={'Tambah Grade'}
                                        >
                                            <>
                                                <div className="grid   gap-3 w-full px-5 py-2">
                                                    <>
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault()
                                                            console.log(newGradeIsi)
                                                            postMasterMesin()
                                                        }}>
                                                            <div className="flex w-full flex-col">
                                                                <label className="text-black text-xs font-bold">
                                                                    Nama Grade
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setKategori(e.target.value) }}
                                                                        type="text"
                                                                        className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                            </div>
                                                            {gradeIsi?.data.map((item: any, index: any) => (
                                                                <div key={index} className='flex justify-between'>
                                                                    <div className='flex flex-col'>

                                                                        <label className="text-black text-xs font-bold">
                                                                            {item.name}
                                                                        </label>
                                                                    </div>
                                                                    <div className='flex flex-col'>
                                                                        <label>Bayaran:</label>
                                                                        <input type="number"
                                                                            className='border-2 border-stroke'
                                                                            name="bayaran" onChange={(e) => handleInputChange(index, e)} />
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <div className=" pt-3">
                                                                <button
                                                                    disabled={isLoading}
                                                                    type='submit'
                                                                    value='submit'
                                                                    className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                >
                                                                    SIMPAN
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </>
                                                </div>
                                            </>
                                        </ModalKosonganSmall>
                                    </>
                                )
                                }
                            </div>
                        </div>

                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 gap-2 px-3 py-4 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">


                                <label className="text-neutral-500 text-xs font-semibold  col-span-3">
                                    No Kategori
                                </label>
                                {grade != null &&
                                    grade?.data[0]?.isi_grade?.map((data: any, i: any) => (
                                        <>
                                            <label className="text-neutral-500 text-xs font-semibold">
                                                {data.grade_column?.name}
                                            </label>
                                        </>))}
                            </div>
                            <div className="w-2 h-full "></div>
                            {grade != null &&
                                grade?.data?.map((data: any, i: any) => {

                                    return (
                                        <>
                                            <div className="grid grid-cols-12 gap-2 px-3 items-center py-2 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">


                                                <label className="text-neutral-500 text-xs font-semibold  col-span-3">
                                                    {i + 1}. {data.kategori}
                                                </label>
                                                {data.isi_grade?.map((data2: any, i: any) => (
                                                    <>
                                                        <label className="text-neutral-500 text-xs font-semibold ">
                                                            {formatInteger(data2.bayaran)}
                                                        </label>
                                                    </>
                                                ))}

                                                <button
                                                    onClick={() => {
                                                        getGrade1(i + 1)
                                                        openEdit(i)
                                                    }}
                                                    className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                    EDIT
                                                </button>
                                                {showEdit[i] == true && (

                                                    <ModalKosonganSmall
                                                        isOpen={showEdit[i]}
                                                        onClose={() => closeEdit(i)}
                                                        judul={'Edit Grade'}
                                                    >
                                                        <>
                                                            <div className="grid   gap-3 w-full px-5 py-2">
                                                                <>

                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Nama Grade
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.kategori}
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setKategoriEdit(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {data.isi_grade?.map((item: any, index: any) => (
                                                                        <div key={index} className='flex justify-between'>
                                                                            <div className='flex flex-col'>

                                                                                <label className="text-black text-xs font-bold">
                                                                                    {item.grade_column?.name}
                                                                                </label>
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label>Bayaran:</label>
                                                                                <input type="number"
                                                                                    defaultValue={item.bayaran}
                                                                                    className='border-2 border-stroke'
                                                                                    name="bayaran" onChange={(e) => handleInputChangeEdit(index, e)} />
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    <div className=" pt-3">
                                                                        <button
                                                                            disabled={isLoading}
                                                                            onClick={() => {
                                                                                console.log(newGradeIsiEdit)
                                                                                editMasterMesin(data.id)
                                                                            }}
                                                                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                        >
                                                                            SIMPAN
                                                                        </button>
                                                                    </div>

                                                                </>
                                                            </div>
                                                        </>
                                                    </ModalKosonganSmall>
                                                )}

                                            </div>
                                        </>
                                    )
                                })}
                        </div>
                    </div>
                </main>

            </>

        </div>
    )
}

export default IsiMasterGrade
