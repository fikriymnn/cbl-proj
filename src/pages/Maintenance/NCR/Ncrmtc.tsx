import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import TabNcrMTC from '../../../components/Tables/Maintenance/NCR/TabNcr'


function NcrMtc() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>NCR</p>
                <TabNcrMTC />
            </>
        </DefaultLayout>
    )
}

export default NcrMtc