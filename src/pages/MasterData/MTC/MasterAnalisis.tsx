import TabAnalisisMTC from '../../../components/Tables/MasterData/TabAnalisisMTC';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterAnalisis = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Master Data &gt; Analisis MTC
      </p>
      <TabAnalisisMTC />
    </DefaultLayout>
  );
};

export default MasterAnalisis;
