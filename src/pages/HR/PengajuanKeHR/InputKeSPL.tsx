import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabSPLKeHR from '../../../components/Tables/HR/PengajuanKeHR/BuatSPLKeHR/TabSPLKeHR'


function InputKeSpl() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Lembur</p>
                <TabSPLKeHR />
            </>
        </DefaultLayout>
    )
}

export default InputKeSpl