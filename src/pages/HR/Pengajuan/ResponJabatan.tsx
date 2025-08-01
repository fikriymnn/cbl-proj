import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabJabatanHR from '../../../components/Tables/HR/Pengajuan/Jabatan/TabJabatanHR'




function ResponJabatan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Respon Pengajuan Jabatan </p>
                <TabJabatanHR />
            </>
        </DefaultLayout>
    )
}

export default ResponJabatan