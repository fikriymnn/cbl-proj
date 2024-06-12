import TableSPBSparePart from '../../../components/Tables/Maintenance/SPB/TableSPBSparePart';
import DefaultLayout from '../../../layout/DefaultLayout';

const SpbSparePart = () => {

    return (
        <DefaultLayout>
            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; SPB &gt; Sparepart </p>
            <TableSPBSparePart />
        </DefaultLayout>
    );
};

export default SpbSparePart;
