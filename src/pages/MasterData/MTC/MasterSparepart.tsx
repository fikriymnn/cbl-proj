
import TableSparepart from '../../../components/Tables/MasterData/TableSparepart';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterSparepart = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Sparepart</p>
            <TableSparepart />

        </DefaultLayout>
    );
};

export default MasterSparepart;
