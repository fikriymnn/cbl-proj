import MutasiBarangRM from '../../components/Tables/GudangRM/MutasiBarangRM';
import DefaultLayout from '../../layout/DefaultLayout';

const MutasiRMPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Gudang RM &gt; Mutasi
      </p>
      <MutasiBarangRM />
    </DefaultLayout>
  );
};

export default MutasiRMPage;
