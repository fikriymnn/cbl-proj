import TabKalibrasi from '../../../components/Tables/QualityControl/KalibrasiAlatUkur/TabKalibrasi';
import DefaultLayout from '../../../layout/DefaultLayout';

const KalibrasiAlatUkur = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Kalibrasi Alat Ukur
      </p>
      <TabKalibrasi />
    </DefaultLayout>
  );
};

export default KalibrasiAlatUkur;
