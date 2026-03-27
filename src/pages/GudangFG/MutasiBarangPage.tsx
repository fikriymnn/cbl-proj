import MutasiBarang from '../../components/Tables/GudangFG/MutasiBarang';
import DefaultLayout from '../../layout/DefaultLayout';

const MutasiBarangPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; Mutasi Barang
        </p>
        <MutasiBarang />
      </>
    </DefaultLayout>
  );
};

export default MutasiBarangPage;
