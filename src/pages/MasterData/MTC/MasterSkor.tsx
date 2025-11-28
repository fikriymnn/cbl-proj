import DefaultLayout from '../../../layout/DefaultLayout';
import TableMasterSkor from '../../../components/Tables/MasterData/TableMasterSkor';

const MasterSkorMTC = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Master Data &gt; Skor MTC
      </p>
      <TableMasterSkor />
    </DefaultLayout>
  );
};

export default MasterSkorMTC;
