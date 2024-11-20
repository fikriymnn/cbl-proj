import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import IsiMasterCutiKhusus from '../../../components/Tables/HR/MasterData/MasterCutiKhusus'



function MasterCutiKhusus() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; Cuti Khusus</p>
                <IsiMasterCutiKhusus />
            </>
        </DefaultLayout>
    )
}

export default MasterCutiKhusus