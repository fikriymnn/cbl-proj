import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import TableUser from '../../components/Tables/MasterData/TableUser'

function MasterUsers() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Users</p>

                <TableUser />
            </>
        </DefaultLayout>
    )
}

export default MasterUsers