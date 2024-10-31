import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabIzinHR from '../../../components/Tables/HR/Pengajuan/Izin/TabIzinHR'


function IzinHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Izin</p>
                <TabIzinHR />
            </>
        </DefaultLayout>
    )
}

export default IzinHR