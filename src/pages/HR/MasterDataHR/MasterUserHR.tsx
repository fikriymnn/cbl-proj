import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import MasterUserHRIsi from '../../../components/Tables/HR/MasterData/MasterUserHR'



function MasterUserHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; User</p>
                <MasterUserHRIsi />
            </>
        </DefaultLayout>
    )
}

export default MasterUserHR