import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabMasterJadwal from '../../../components/Tables/PPIC/MasterDataPPIC/TabMasterJadwal'

function MasterJadwal() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PPIC {'>'} Master Data</p>
                <TabMasterJadwal />
            </>
        </DefaultLayout>
    )
}

export default MasterJadwal