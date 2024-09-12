import React from 'react'
import DefaultLayout from '../../../../layout/DefaultLayout'
import TabCapaMTC from '../../../../components/Tables/Maintenance/CAPA/TabCapa'
import TabCapaLaporQC from '../../../../components/Tables/QualityControl/Lapor/CAPA/TabCapa'
import TabCapaLaporMR from '../../../../components/Tables/MR/Lapor/CAPA/TabCapa'


function CapaLaporMR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MR &gt; CAPA MASUK </p>
                <TabCapaLaporMR />
            </>
        </DefaultLayout>
    )
}

export default CapaLaporMR