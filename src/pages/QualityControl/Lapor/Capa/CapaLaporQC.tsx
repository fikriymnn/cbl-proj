import React from 'react'
import DefaultLayout from '../../../../layout/DefaultLayout'
import TabCapaMTC from '../../../../components/Tables/Maintenance/CAPA/TabCapa'
import TabCapaLaporQC from '../../../../components/Tables/QualityControl/Lapor/CAPA/TabCapa'


function CapaLaporQC() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; CAPA MASUK </p>
                <TabCapaLaporQC />
            </>
        </DefaultLayout>
    )
}

export default CapaLaporQC