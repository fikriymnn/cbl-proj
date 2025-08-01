import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import TabNcrMTC from '../../../components/Tables/Maintenance/NCR/TabNcr'
import TabNcrHR from '../../../components/Tables/HR/NCR/TabNcr'


function NcrHr() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>NCR</p>
                <TabNcrHR />
            </>
        </DefaultLayout>
    )
}

export default NcrHr