import MasterTableKategoriKendala from '../../../components/Tables/Produksi/MasterData/MasterTableKategoriKendala';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterKategoriKendala = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Master Kategori Kendala
      </p>
      <MasterTableKategoriKendala />
    </DefaultLayout>
  );
};

export default MasterKategoriKendala;
