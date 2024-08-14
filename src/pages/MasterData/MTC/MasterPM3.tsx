
import React from 'react';
import TablePM2 from '../../../components/Tables/MasterData/PM2/TablePM2';
import DefaultLayout from '../../../layout/DefaultLayout';
import TablePM3 from '../../../components/Tables/MasterData/PM3/TablePM3';

const MasterPM3 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 3</p>
            <TablePM3 />

        </DefaultLayout>
    );
};

export default MasterPM3;
