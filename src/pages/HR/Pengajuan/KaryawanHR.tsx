import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabKaryawan from '../../../components/Tables/HR/Pengajuan/Karyawan/TabKaryawan'


function KaryawanHr() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Karyawan</p>
                <TabKaryawan />
            </>
        </DefaultLayout>
    )
}

export default KaryawanHr