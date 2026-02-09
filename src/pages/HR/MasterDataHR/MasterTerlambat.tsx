import DefaultLayout from '../../../layout/DefaultLayout';
import MasterIzinTerlambatHRD from '../../../components/Tables/HR/MasterData/MasterIzinTerlambatHRD';

function MasterTerlambatHPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data HR &gt; Terlambat
        </p>
        <MasterIzinTerlambatHRD />
      </>
    </DefaultLayout>
  );
}

export default MasterTerlambatHPage;
