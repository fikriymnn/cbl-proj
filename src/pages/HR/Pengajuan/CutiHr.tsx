import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCutiHR from '../../../components/Tables/HR/Pengajuan/Cuti/TabCutiHR'


function CutiHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Cuti</p>
                <TabCutiHR />
            </>
        </DefaultLayout>
    )
}

export default CutiHR