import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCapaHR from '../../../components/Tables/HR/CAPA/TabCapa'


function CapaHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>CAPA MASUK</p>
                <TabCapaHR />
            </>
        </DefaultLayout>
    )
}

export default CapaHR