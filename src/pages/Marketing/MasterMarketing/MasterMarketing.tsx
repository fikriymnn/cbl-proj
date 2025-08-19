import DefaultLayout from '../../../layout/DefaultLayout';
import TabMasterMarketing from '../../../components/Tables/Marketing/MasterData/TabMasterMarketing';

function MasterMarketing() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data Marketing&gt; Kalkulasi
        </p>
        <TabMasterMarketing />
      </>
    </DefaultLayout>
  );
}

export default MasterMarketing;
