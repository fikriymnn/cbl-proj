import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import TabJadwalProduksi from '../../../components/Tables/PPIC/JadwalProduksi/TabJadwalProduksi'

function JadwalProduksiPPIC() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>JADWAL PRODUKSI</p>
                <TabJadwalProduksi />
            </>
        </DefaultLayout>
    )
}

export default JadwalProduksiPPIC