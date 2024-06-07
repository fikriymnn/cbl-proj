

import DefaultLayout from '../../../layout/DefaultLayout';
import CrumbSparepart from './header';
import HistoriOpname from './historiOpname';

const MainOpname = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Opname</p>
            <CrumbSparepart />


        </DefaultLayout>
    );
};

export default MainOpname;
