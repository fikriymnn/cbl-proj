import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabHistoryPengajuanKeHR from '../../../components/Tables/HR/PengajuanKeHR/TabHistoryPengajuanKeHR'


function HistoryPengajuanKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; History Pengajuan</p>
                <TabHistoryPengajuanKeHR />
            </>
        </DefaultLayout>
    )
}

export default HistoryPengajuanKeHR