import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import AddMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/AddMasterKaryawanIsi'


function AddMasterKaryawan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personnel Management &gt; Add Personnel</p>
                <AddMasterKaryawanIsi />
            </>
        </DefaultLayout>
    )
}

export default AddMasterKaryawan