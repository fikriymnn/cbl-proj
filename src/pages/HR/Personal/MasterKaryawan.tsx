import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import MasterPerusahaanIsi from '../../../components/Tables/HR/Personnel/MasterPerusahaanIsi'
import MasterKaryawanIsi from '../../../components/Tables/HR/Personnel/MasterKaryawanIsi'


function MasterKaryawan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personnel Management &gt; Master Karyawan</p>
                <MasterKaryawanIsi />
            </>
        </DefaultLayout>
    )
}

export default MasterKaryawan