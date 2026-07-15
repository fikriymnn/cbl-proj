import TambahBahanSPV from '../../components/Tables/Produksi/TambahBahan/TambahBahanSPV';
import DefaultLayout from '../../layout/DefaultLayout';

const TambahBahanSPVPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Tambah Bahan
      </p>
      <TambahBahanSPV />
    </DefaultLayout>
  );
};

export default TambahBahanSPVPage;
