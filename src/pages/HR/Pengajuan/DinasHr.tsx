import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabDinas from '../../../components/Tables/HR/Pengajuan/Dinas/TabDinas'


function DinasHr() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Dinas</p>
                <TabDinas />
            </>
        </DefaultLayout>
    )
}

export default DinasHr