import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabPayrollBulan from '../../../components/Tables/HR/PayrollBulanan/TabPayrollBulan'



function PayrollBulanPage() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Payroll Bulanan</p>
                <TabPayrollBulan />
            </>
        </DefaultLayout>
    )
}

export default PayrollBulanPage