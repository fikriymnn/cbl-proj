import DefaultLayout from '../../../layout/DefaultLayout';
import MasterKendaraan from '../../../components/Tables/HR/MasterData/MasterKendaraan';

function MasterKendaraanHR() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data HR &gt; Kendaraan
        </p>
        <MasterKendaraan />
      </>
    </DefaultLayout>
  );
}

export default MasterKendaraanHR;
