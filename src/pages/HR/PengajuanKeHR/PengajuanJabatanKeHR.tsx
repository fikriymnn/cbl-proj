import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabPengajuanJabatanKeHR from '../../../components/Tables/HR/PengajuanKeHR/PengajuanJabatanKeHR/TabPengajuanJabatanKeHR'

function PengajuanJabatanKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Buat Pengajuan Jabatan</p>
                <TabPengajuanJabatanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PengajuanJabatanKeHR