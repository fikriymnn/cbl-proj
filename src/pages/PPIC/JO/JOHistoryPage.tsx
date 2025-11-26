import JOHistory from '../../../components/Tables/PPIC/JO/JOHistory';
import DefaultLayout from '../../../layout/DefaultLayout';

function JOHistoryPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JO HISTORY PPIC
        </p>
        <JOHistory />
      </>
    </DefaultLayout>
  );
}

export default JOHistoryPage;
