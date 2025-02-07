import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import TabPengajuanKeHR from '../../components/Tables/PengajuanKeHR/TabPengajuanKeHR'




function PengajuanAllDeptHistory() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>History Pengajuan</p>
                <TabPengajuanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PengajuanAllDeptHistory