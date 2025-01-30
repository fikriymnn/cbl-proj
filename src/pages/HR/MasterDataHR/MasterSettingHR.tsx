import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import MasterSettingHRD from '../../../components/Tables/HR/MasterData/MasterSetting'

function MasterSettingHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; Setting</p>
                <MasterSettingHRD />
            </>
        </DefaultLayout>
    )
}

export default MasterSettingHR