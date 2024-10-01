import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import ProsesPrepress from '../../components/Tables/QualityControl/PrePress/ProsesPrepress'
import TabPrePress from '../../components/Tables/QualityControl/PrePress/TabPrepress'



function PrePress() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Pre-Press</p>
                <TabPrePress />
            </>
        </DefaultLayout>
    )
}

export default PrePress