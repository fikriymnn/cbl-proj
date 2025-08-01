import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabResponHistoryPengajuanHR from '../../../components/Tables/HR/Pengajuan/TabHistoryResponPengajuan'


function HistoryResponPengajuan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>History Respon Pengajuan </p>
                <TabResponHistoryPengajuanHR />
            </>
        </DefaultLayout>
    )
}

export default HistoryResponPengajuan