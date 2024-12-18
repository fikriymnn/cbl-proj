import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabMasterPayroll from '../../../components/Tables/HR/MasterData/MasterPayroll/TabMasterPayroll'



function MasterPayrollHR() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; Payroll</p>
                <TabMasterPayroll />
            </>
        </DefaultLayout>
    )
}

export default MasterPayrollHR