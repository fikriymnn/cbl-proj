import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabSakitHR from '../../../components/Tables/HR/Pengajuan/Sakit/TabSakitHR'


function SakitHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pengajuan &gt; Sakit</p>
                <TabSakitHR />
            </>
        </DefaultLayout>
    )
}

export default SakitHR