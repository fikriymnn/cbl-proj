import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabPengajuanKeHR from '../../../components/Tables/HR/PengajuanKeHR/TabPengajuanKeHR'


function PengajuanKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Buat Pengajuan</p>
                <TabPengajuanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PengajuanKeHR