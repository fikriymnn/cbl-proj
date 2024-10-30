import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import AddMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/AddMasterKaryawanIsi'
import TabInputSpl from '../../../components/Tables/HR/Pengajuan/InputSPL/TabInputSpl'


function InputKeSpl() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PENGAJUAN KE HR  &gt; Lembur</p>
                <TabInputSpl />
            </>
        </DefaultLayout>
    )
}

export default InputKeSpl