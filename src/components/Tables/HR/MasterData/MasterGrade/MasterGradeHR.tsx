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



    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [kategori, setKategori] = useState<any>();
    const [insentif, setInsentif] = useState<any>(0);
    const [lemburBiasa, setLemburBiasa] = useState<any>(0);
    const [lemburLibur, setLemburLibur] = useState<any>(0);
    const [tunjanganJabatan, setTunjanganJabatan] = useState<any>(0);
    const [tunjanganKerjaMalam, setTunjanganKerjaMalam] = useState<any>(0);
    const [tunjanganKopi, setTunjanganKopi] = useState<any>(0);
    const [uangDinas, setUangDinas] = useState<any>(0);
    const [uangHadir, setUangHadir] = useState<any>(0);
    const [uangKawal, setUangKawal] = useState<any>(0);
    const [uangMakanLembur, setUangMakanLembur] = useState<any>(0);
    const [uangOngkosPulang, setUangOngkosPulang] = useState<any>(0);


    async function postMasterMesin() {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    kategori: kategori,
                    insentif: insentif,
                    lembur_biasa: lemburBiasa,
                    lembur_libur: lemburLibur,
                    tunjangan_jabatan: tunjanganJabatan,
                    tunjangan_kerja_malam: tunjanganKerjaMalam,
                    tunjangan_kopi: tunjanganKopi,
                    uang_dinas: uangDinas,
                    uang_hadir: uangHadir,
                    uang_kawal: uangKawal,
                    uang_makan_lembur: uangMakanLembur,
                    uang_ongkos_pulang: uangOngkosPulang

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



    const [kategoriEdit, setKategoriEdit] = useState<any>();
    const [insentifEdit, setInsentifEdit] = useState<any>(0);
    const [lemburBiasaEdit, setLemburBiasaEdit] = useState<any>(0);
    const [lemburLiburEdit, setLemburLiburEdit] = useState<any>(0);
    const [tunjanganJabatanEdit, setTunjanganJabatanEdit] = useState<any>(0);
    const [tunjanganKerjaMalamEdit, setTunjanganKerjaMalamEdit] = useState<any>(0);
    const [tunjanganKopiEdit, setTunjanganKopiEdit] = useState<any>(0);
    const [uangDinasEdit, setUangDinasEdit] = useState<any>(0);
    const [uangHadirEdit, setUangHadirEdit] = useState<any>(0);
    const [uangKawalEdit, setUangKawaEditl] = useState<any>(0);
    const [uangMakanLemburEdit, setUangMakanLemburEdit] = useState<any>(0);
    const [uangOngkosPulangEdit, setUangOngkosPulangEdit] = useState<any>(0);


    async function editMasterMesin(id: any) {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    kategori: kategoriEdit,
                    insentif: insentifEdit,
                    lembur_biasa: lemburBiasaEdit,
                    lembur_libur: lemburLiburEdit,
                    tunjangan_jabatan: tunjanganJabatanEdit,
                    tunjangan_kerja_malam: tunjanganKerjaMalamEdit,
                    tunjangan_kopi: tunjanganKopiEdit,
                    uang_dinas: uangDinasEdit,
                    uang_hadir: uangHadirEdit,
                    uang_kawal: uangKawalEdit,
                    uang_makan_lembur: uangMakanLemburEdit,
                    uang_ongkos_pulang: uangOngkosPulangEdit

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
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='flex flex-col gap-1'>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Uang Hadir
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setUangHadir(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Lembur Biasa
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setLemburBiasa(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Lembur Libur
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setLemburLibur(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Tunjangan Jabatan
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setTunjanganJabatan(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Tunjangan Kerja Malam
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setTunjanganKerjaMalam(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Tunjangan Kopi
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setTunjanganKopi(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Uang Dinas
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setUangDinas(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Uang Kawal
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setUangKawal(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Uang Makan Lembur
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setUangMakanLembur(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Uang Ongkos Pulang
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setUangOngkosPulang(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <label className="text-black text-xs font-semibold">
                                                                    Insentif
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setInsentif(e.target.value) }}
                                                                        type="number"
                                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                            </div>
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
                            <div className="flex gap-2 px-3 py-4 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">
                                <label className="text-neutral-500 text-xs font-semibold  w-[12%]">
                                    No Kategori
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[8%]">
                                    Uang Hadir
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[8%]">
                                    Lembur Biasa
                                </label>

                                <label className="text-neutral-500 text-xs font-semibold w-[8%]">
                                    Lembur Libur
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Tunjangan Jabatan
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Tunjangan Kerja Malam
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold w-[8%]">
                                    Tunjangan Kopi
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Uang Dinas
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Uang Kawal
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Uang Makan Lembur
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Uang Ongkos Pulang
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                    Insentif
                                </label>
                                <div className="text-neutral-500 text-xs font-semibold  w-[8%]">

                                </div>
                            </div>
                            <div className="w-2 h-full "></div>
                            {grade != null &&
                                grade?.data?.map((data: any, i: any) => {

                                    return (
                                        <>
                                            <div className="flex gap-2 px-3 items-center py-2 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">


                                                <label className="text-neutral-500 text-xs font-semibold w-[12%]">
                                                    {i + 1}. {data.kategori}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold  w-[8%]">
                                                    {data.uang_hadir == 0 || data.uang_hadir == null ? '-' : formatInteger(data.uang_hadir)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold  w-[8%] ">
                                                    {data.lembur_biasa == 0 || data.lembur_biasa == null ? '-' : formatInteger(data.lembur_biasa)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.lembur_libur == 0 || data.lembur_libur == null ? '-' : formatInteger(data.lembur_libur)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.tunjangan_jabatan == 0 || data.tunjangan_jabatan == null ? '-' : formatInteger(data.tunjangan_jabatan)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.tunjangan_kerja_malam == 0 || data.tunjangan_kerja_malam == null ? '-' : formatInteger(data.tunjangan_kerja_malam)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.tunjangan_kopi == 0 || data.tunjangan_kopi == null ? '-' : formatInteger(data.tunjangan_kopi)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.uang_dinas == 0 || data.uang_dinas == null ? '-' : formatInteger(data.uang_dinas)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.uang_kawal == 0 || data.uang_kawal == null ? '-' : formatInteger(data.uang_kawal)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold  w-[8%] ">
                                                    {data.uang_makan_lembur == 0 || data.uang_makan_lembur == null ? '-' : formatInteger(data.uang_makan_lembur)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.uang_ongkos_pulang == 0 || data.uang_ongkos_pulang == null ? '-' : formatInteger(data.uang_ongkos_pulang)}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold   w-[8%]">
                                                    {data.insentif == 0 || data.insentif == null ? '-' : formatInteger(data.insentif)}
                                                </label>
                                                <button
                                                    onClick={() => {

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
                                                                    <div className='flex flex-col gap-1'>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Uang Hadir
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.uang_hadir}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setUangHadirEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Lembur Biasa
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.lembur_biasa}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setLemburBiasaEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Lembur Libur
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.lembur_libur}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setLemburLiburEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Tunjangan Jabatan
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.tunjangan_jabatan}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setTunjanganJabatanEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Tunjangan Kerja Malam
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.tunjangan_kerja_malam}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setTunjanganKerjaMalamEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Tunjangan Kopi
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.tunjangan_kopi}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setTunjanganKopiEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Uang Dinas
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.uang_dinas}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setUangDinasEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Uang Kawal
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.uang_kawal}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setUangKawaEditl(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Uang Makan Lembur
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.uang_makan_lembur}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setUangMakanLemburEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Uang Ongkos Pulang
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.uang_ongkos_pulang}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setUangOngkosPulangEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <label className="text-black text-xs font-semibold">
                                                                            Insentif
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                defaultValue={data.insentif}
                                                                                required
                                                                                name="nama_grade"
                                                                                onChange={(e) => { setInsentifEdit(e.target.value) }}
                                                                                type="number"
                                                                                className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className=" pt-3">
                                                                        <button
                                                                            disabled={isLoading}
                                                                            onClick={() => {

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
                        </div >
                    </div>
                </main>

            </>

        </div>
    )
}

export default IsiMasterGrade
