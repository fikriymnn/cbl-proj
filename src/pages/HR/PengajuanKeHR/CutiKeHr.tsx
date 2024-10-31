import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCutiKeHR from '../../../components/Tables/HR/PengajuanKeHR/CutiKeHR/TabCutiKeHR'


function CutiKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Cuti</p>
                <TabCutiKeHR />
            </>
        </DefaultLayout>
    )
}

export default CutiKeHR