import React, { useEffect, useState } from 'react';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import axios from 'axios';
import Loading from '../../../Loading';

function MasterPerusahaanIsi() {

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getPerusahaan();
    }, []);

    const [perusahaan, setPerusahaan] = useState<any>();

    async function getPerusahaan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/perusahaan`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setPerusahaan(res.data.data)

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [alamat, setAlamat] = useState<any>();
    const [email, setEmail] = useState<any>();
    const [kecamatan, setKecamatan] = useState<any>();
    const [kelurahan, setKelurahan] = useState<any>();
    const [kodePos, setKodePos] = useState<any>();
    const [kota, setKota] = useState<any>();
    const [nama, setNama] = useState<any>();
    const [negara, setNegara] = useState<any>();
    const [noTlp, setNoTlp] = useState<any>();

    async function putPerusahaan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/perusahaan`;
        try {
            setIsLoading(true)
            const res = await axios.put(
                url,
                {
                    alamat: alamat,
                    email: email,
                    kecamatan: kecamatan,
                    kelurahan: kelurahan,
                    kode_pos: kodePos,
                    kota: kota,
                    nama: nama,
                    negara: negara,
                    no_tlp: noTlp
                },
                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setPerusahaan(res.data.data)
            getPerusahaan()
            window.location.reload();
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showEdit, setShowEdit] = useState(false);
    const openModalEdit = () => setShowEdit(true);
    const closeModalEdit = () => setShowEdit(false);

    return (

        <div className='grid grid-cols-2 w-full rounded-md bg-white h-full py-4 px-6'>
            {isLoading && <Loading />}
            <div className='flex flex-col gap-1'>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Nama Perusahaan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.nama}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Alamat
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.alamat}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kelurahan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.kelurahan}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kecamatan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.kecamatan}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kota/Kab
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.kota}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kode Pos
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.kode_pos}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Negara
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.negara}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    No. Telepon
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.no_tlp}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Email
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {perusahaan?.email}
                </label>
            </div>
            <div className='px-2 py-1 flex w-full justify-end'>
                <button
                    onClick={() => openModalEdit()}
                    className='px-8 h-7 bg-blue-600 items-center justify-center text-white font-semibold rounded-md'>
                    EDIT
                </button>
                {showEdit == true && (
                    <>
                        <ModalKosongan
                            isOpen={showEdit}
                            onClose={() => closeModalEdit()}
                            judul={'Edit Master Perusahaan'}
                        >
                            <>
                                <div className='flex flex-col gap-1'>
                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Nama Perusahaan
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setNama(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.nama} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Alamat
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setAlamat(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.alamat} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kelurahan
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setKelurahan(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.kelurahan} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kecamatan
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setKecamatan(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.kecamatan} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kota/Kab
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setKota(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.kota} />


                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kode Pos
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setKodePos(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.kode_pos} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Negara
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setNegara(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.negara} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        No. Telepon
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setNoTlp(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.no_tlp} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Email
                                    </label>
                                    <input type="text"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={perusahaan?.email} />

                                    <button
                                        onClick={() => putPerusahaan()}
                                        className='px-8 h-7 bg-green-500 items-center justify-center text-white font-semibold rounded-md mt-8'>
                                        SIMPAN PERUBAHAN
                                    </button>
                                </div>

                            </>
                        </ModalKosongan>
                    </>
                )
                }
            </div>
        </div>

    )
}

export default MasterPerusahaanIsi
