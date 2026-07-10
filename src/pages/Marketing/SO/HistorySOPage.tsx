import TabHistorySO from '../../../components/Tables/Marketing/SO/TabHistorySo';
import DefaultLayout from '../../../layout/DefaultLayout';

function HistorySOPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          History SO
        </p>
        <TabHistorySO />
      </>
    </DefaultLayout>
  );
}

export default HistorySOPage;
