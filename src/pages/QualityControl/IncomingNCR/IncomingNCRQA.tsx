import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import TabNcrMTC from '../../../components/Tables/Maintenance/NCR/TabNcr'
import TabNcrQA from '../../../components/Tables/QualityControl/NCR/TabNCRQA'


function IncomingNCRQA() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; NCR</p>
                <TabNcrQA />
            </>
        </DefaultLayout>
    )
}

export default IncomingNCRQA