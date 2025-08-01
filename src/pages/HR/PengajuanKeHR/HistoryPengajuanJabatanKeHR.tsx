import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabHistoryPengajuanJabatanKeHR from '../../../components/Tables/HR/PengajuanKeHR/PengajuanJabatanKeHR/TabHistoryPengajuanJabatanKeHr'

function HistoryPengajuanJabatanKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; History Pengajuan Jabatan</p>
                <TabHistoryPengajuanJabatanKeHR />
            </>
        </DefaultLayout>
    )
}

export default HistoryPengajuanJabatanKeHR