import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import TabPengajuanKeHR from '../../components/Tables/PengajuanKeHR/TabPengajuanKeHR'




function PengajuanAllDept() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan</p>
                <TabPengajuanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PengajuanAllDept