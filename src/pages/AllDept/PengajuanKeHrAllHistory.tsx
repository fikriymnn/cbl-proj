import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import TabHistoryPengajuanKeHR from '../../components/Tables/PengajuanKeHR/TabHistoryPengajuanKeHR'




function PengajuanAllDeptHistory() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>History Pengajuan</p>
                <TabHistoryPengajuanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PengajuanAllDeptHistory