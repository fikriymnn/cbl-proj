import React from 'react'
import DefaultLayout from '../../../../layout/DefaultLayout'

import TabNcrLaporMR from '../../../../components/Tables/MR/Lapor/NCR/TabNcr'




function NcrLaporMR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MR &gt; NCR</p>
                <TabNcrLaporMR />
            </>
        </DefaultLayout>
    )
}

export default NcrLaporMR