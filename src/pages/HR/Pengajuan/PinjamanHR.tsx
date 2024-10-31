import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabIzinHR from '../../../components/Tables/HR/Pengajuan/Izin/TabIzinHR'
import TabPinjamanHR from '../../../components/Tables/HR/Pengajuan/Pinjaman/TabPinjamanHR'


function PinjamanHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Pinjaman</p>
                <TabPinjamanHR />
            </>
        </DefaultLayout>
    )
}

export default PinjamanHR