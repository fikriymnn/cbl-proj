import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabIzinHR from '../../../components/Tables/HR/Pengajuan/Izin/TabIzinHR'
import TabPinjamanHR from '../../../components/Tables/HR/Pengajuan/Pinjaman/TabPinjamanHR'
import TabPinjamanKeHR from '../../../components/Tables/HR/PengajuanKeHR/PinjamanKeHR/TabPinjamanKeHR'


function PinjamanKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Pinjaman</p>
                <TabPinjamanKeHR />
            </>
        </DefaultLayout>
    )
}

export default PinjamanKeHR