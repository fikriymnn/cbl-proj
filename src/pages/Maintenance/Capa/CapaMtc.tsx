import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCapaMTC from '../../../components/Tables/Maintenance/CAPA/TabCapa'


function CapaMtc() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>CAPA MASUK</p>
                <TabCapaMTC />
            </>
        </DefaultLayout>
    )
}

export default CapaMtc