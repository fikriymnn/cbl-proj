import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import TableUserAll from '../../components/Tables/MasterData/TableUserAll'

function MasterUserAll() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Users</p>

                <TableUserAll />
            </>
        </DefaultLayout>
    )
}

export default MasterUserAll