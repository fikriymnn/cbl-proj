import HistoryTambahBahan from '../../components/Tables/Produksi/TambahBahan/HistoryTambahBahan';
import DefaultLayout from '../../layout/DefaultLayout';

const HistoryTambahBahanPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; History Tambah Bahan
      </p>
      <HistoryTambahBahan />
    </DefaultLayout>
  );
};

export default HistoryTambahBahanPage;
