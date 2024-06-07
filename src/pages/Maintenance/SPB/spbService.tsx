
import TableSPBService from '../../../components/Tables/Maintenance/SPB/TableSPBService';
import DefaultLayout from '../../../layout/DefaultLayout';

const SpbService = () => {

    return (
        <DefaultLayout>
            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; SPB &gt; Service </p>
            <TableSPBService />
        </DefaultLayout>
    );
};

export default SpbService;
