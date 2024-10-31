import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabSP from '../../../components/Tables/HR/Pengajuan/SP/TabSP'


function SPHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; SP</p>
                <TabSP />
            </>
        </DefaultLayout>
    )
}

export default SPHR