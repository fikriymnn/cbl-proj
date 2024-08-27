import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabCapaQA from '../../../components/Tables/QualityControl/Capa/TabCapaQA'


function QcCapa() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MR &gt; CAPA</p>
                <TabCapaQA />
            </>
        </DefaultLayout>
    )
}

export default QcCapa