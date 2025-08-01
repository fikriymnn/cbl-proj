import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabPayroll from '../../../components/Tables/HR/Payroll/TabPayroll'



function PayrollPage() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Payroll </p>
                <TabPayroll />
            </>
        </DefaultLayout>
    )
}

export default PayrollPage