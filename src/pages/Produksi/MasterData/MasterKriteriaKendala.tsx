import MasterTableKriteriaKendala from '../../../components/Tables/Produksi/MasterData/MasterTableKriteriaKendala';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterKriteriaKendala = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Master Kriteria Kendala
      </p>
      <MasterTableKriteriaKendala />
    </DefaultLayout>
  );
};

export default MasterKriteriaKendala;
