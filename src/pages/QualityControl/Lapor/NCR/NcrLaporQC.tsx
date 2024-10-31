import React from 'react'
import DefaultLayout from '../../../../layout/DefaultLayout'
import TabNcrLaporQC from '../../../../components/Tables/QualityControl/Lapor/NCR/TabNcr'




function NcrLaporQC() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; NCR</p>
                <TabNcrLaporQC />
            </>
        </DefaultLayout>
    )
}

export default NcrLaporQC