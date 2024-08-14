
import React from 'react';
import PM2TambahInspection from '../../../components/Tables/MasterData/PM2/PM2TambahInspection';
import DefaultLayout from '../../../layout/DefaultLayout';
import PM3TambahInspection from '../../../components/Tables/MasterData/PM3/PM3TambahInspection';

const MasterPM3TambahInspection = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 3 &gt;  Checklist Activity &gt;  Tambah Inspection</p>
            <PM3TambahInspection />

        </DefaultLayout>
    );
};

export default MasterPM3TambahInspection;
