import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabHistoryJabatan from '../../../components/Tables/HR/Pengajuan/Jabatan/TabHistoryJabatan'




function HistoryResponJabatan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>History Pengajuan Jabatan </p>
                <TabHistoryJabatan />
            </>
        </DefaultLayout>
    )
}

export default HistoryResponJabatan