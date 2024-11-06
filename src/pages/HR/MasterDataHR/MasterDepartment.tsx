import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import MasterShiftHRD from '../../../components/Tables/HR/MasterData/MasterShiftHRD'
import TabDepartmentMaster from '../../../components/Tables/HR/MasterData/TabDepartmentMaster'



function MasterDepartment() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; Department</p>
                <TabDepartmentMaster />
            </>
        </DefaultLayout>
    )
}

export default MasterDepartment