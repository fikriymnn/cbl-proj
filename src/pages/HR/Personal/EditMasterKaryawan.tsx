import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import AddMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/AddMasterKaryawanIsi'
import EditMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/EditMasterKaryawanIsi'


function EditMasterKaryawan() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personnel Management &gt; Edit Personnel</p>
                <EditMasterKaryawanIsi />
            </>
        </DefaultLayout>
    )
}

export default EditMasterKaryawan