import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import LengkapiMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/LengkapiMasterKaryawanIsi'


function LengkapiMasterKaryawan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personnel Management &gt; Data Karyawan</p>
                <LengkapiMasterKaryawanIsi />
            </>
        </DefaultLayout>
    )
}

export default LengkapiMasterKaryawan