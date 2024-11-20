import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabMasterGrade from '../../../components/Tables/HR/MasterData/MasterGrade/TabMasterGrade'



function MasterGradeHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; Grade</p>
                <TabMasterGrade />
            </>
        </DefaultLayout>
    )
}

export default MasterGradeHR