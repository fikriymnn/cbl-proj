import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabPayroll from '../../../components/Tables/HR/Payroll/TabPayroll'
import TabAccPayroll from '../../../components/Tables/HR/Payroll/TabACCPayroll'



function AccPayroll() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Approve Payroll </p>
                <TabAccPayroll />
            </>
        </DefaultLayout>
    )
}

export default AccPayroll