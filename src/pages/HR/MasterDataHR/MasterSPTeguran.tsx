import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import IsiMasterSPTeguran from '../../../components/Tables/HR/MasterData/IsiMasterSPTeguran'



function MasterSPTeguran() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data HR  &gt; SP / Teguran</p>
                <IsiMasterSPTeguran />
            </>
        </DefaultLayout>
    )
}

export default MasterSPTeguran