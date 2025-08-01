import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabResponPengajuanHR from '../../../components/Tables/HR/Pengajuan/TabResponPengajuan'



function ResponPengajuanHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Respon Pengajuan </p>
                <TabResponPengajuanHR />
            </>
        </DefaultLayout>
    )
}

export default ResponPengajuanHR