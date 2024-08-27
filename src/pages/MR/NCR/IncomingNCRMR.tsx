import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabNcrMR from '../../../components/Tables/MR/NCR/TabNCRMR'


function IncomingNCRMR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MR &gt; NCR</p>
                <TabNcrMR />
            </>
        </DefaultLayout>
    )
}

export default IncomingNCRMR