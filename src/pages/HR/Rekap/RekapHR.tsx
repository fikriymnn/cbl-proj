import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabRekapHR from '../../../components/Tables/HR/Rekap/TabRekapHR'


function RekapHRPage() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Rekap </p>
                <TabRekapHR />
            </>
        </DefaultLayout>
    )
}

export default RekapHRPage