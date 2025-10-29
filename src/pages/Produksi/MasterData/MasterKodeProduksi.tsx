import MasterTableKodeProduksi from '../../../components/Tables/Produksi/MasterData/MasterTableKodeProduksi';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterKodeProduksi = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Master Kode Produksi
      </p>
      <MasterTableKodeProduksi />
    </DefaultLayout>
  );
};

export default MasterKodeProduksi;
