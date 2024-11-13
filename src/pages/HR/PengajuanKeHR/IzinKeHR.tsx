import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import TabIzinKeHR from '../../../components/Tables/HR/PengajuanKeHR/IzinKeHR/TabIzinKeHR'


function IzinKeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Izin</p>
                <TabIzinKeHR />
            </>
        </DefaultLayout>
    )
}

export default IzinKeHR