import TambahBahanRM from '../../components/Tables/GudangRM/TambahBahanRM';
import DefaultLayout from '../../layout/DefaultLayout';

const TambahBahanRMPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Gudang RM &gt; Tambah Bahan
      </p>
      <TambahBahanRM />
    </DefaultLayout>
  );
};

export default TambahBahanRMPage;
