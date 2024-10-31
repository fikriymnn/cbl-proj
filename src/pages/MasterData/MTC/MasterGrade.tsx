
import TableAnalisis from '../../../components/Tables/MasterData/TableAnalisis';
import TableGrade from '../../../components/Tables/MasterData/TableGrade';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterGrade = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Grade MTC</p>
            <TableGrade />

        </DefaultLayout>
    );
};

export default MasterGrade;
