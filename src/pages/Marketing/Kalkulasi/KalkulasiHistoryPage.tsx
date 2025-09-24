import DefaultLayout from '../../../layout/DefaultLayout';
import HistoryKalkulasi from '../../../components/Tables/Marketing/Kalkulasi/HistoryKalkulasi';

function KalkulasiHistoryPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Kalkulasi History
        </p>
        <HistoryKalkulasi />
      </>
    </DefaultLayout>
  );
}

export default KalkulasiHistoryPage;
