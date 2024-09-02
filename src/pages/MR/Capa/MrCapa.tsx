import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCapaQA from '../../../components/Tables/QualityControl/Capa/TabCapaQA'
import TabCapaMR from '../../../components/Tables/MR/Capa/TabCapaMR'


function MrCapa() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MR &gt; CAPA</p>
                <TabCapaMR />
            </>
        </DefaultLayout>
    )
}

export default MrCapa