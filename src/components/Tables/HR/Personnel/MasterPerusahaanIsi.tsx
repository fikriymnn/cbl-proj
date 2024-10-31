import React, { useEffect, useState } from 'react';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';

function MasterPerusahaanIsi() {

    const masterPerusahaan =
    {
        nama_perusahaan: 'PT. CAHAYA BERLIAN LESTARI',
        alamat: 'Jl. Paralon II No 5 Cigondewah Kaler',
        kelurahan: 'Cigondewah Kaler',
        kecamatan: 'Bandung Kulon',
        kota: 'Kota Bandung',
        kode_pos: '40124',
        negara: 'Indonesia',
        no_telp: '620226033823',
        email: 'contact@cbloffset.com',
    }

        ;
    const [showEdit, setShowEdit] = useState(false);
    const openModalEdit = () => setShowEdit(true);
    const closeModalEdit = () => setShowEdit(false);

    return (

        <div className='grid grid-cols-2 w-full rounded-md bg-white h-full py-4 px-6'>
            <div className='flex flex-col gap-1'>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Nama Perusahaan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.nama_perusahaan}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Alamat
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.alamat}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kelurahan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.kelurahan}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kecamatan
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.kecamatan}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kota/Kab
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.kota}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Kode Pos
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.kode_pos}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Negara
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.negara}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    No. Telepon
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.no_telp}
                </label>
                <label className=' text-[#6c6b6b] text-sm font-semibold pt-3'>
                    Email
                </label>
                <label className='text-[#0065de] text-xl font-semibold'>
                    {masterPerusahaan.email}
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
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.nama_perusahaan} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Alamat
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.alamat} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kelurahan
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.kelurahan} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kecamatan
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.kecamatan} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kota/Kab
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.kota} />


                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Kode Pos
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.kode_pos} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Negara
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.negara} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        No. Telepon
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.no_telp} />

                                    <label className=' text-[#6c6b6b] text-sm font-semibold pt-1'>
                                        Email
                                    </label>
                                    <input type="text" className='border-2 border-stroke px-2 py-1 rounded-md' defaultValue={masterPerusahaan.email} />

                                    <button

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
