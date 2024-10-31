import ProsesCetakMesin from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/ProsesCetakMesin';
import TabCetak from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/TabCetak';
import TabAmpaHasilRabut from '../../../components/Tables/QualityControl/QualityInspection/AmparHasilLem/TabAmparHasilLem';
import DefaultLayout from '../../../layout/DefaultLayout';

const SamplingHasilRabut = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Inspeksi Quality &gt; AMPAR HASIL LEM
      </p>

      <TabAmpaHasilRabut />
    </DefaultLayout>
  );
};

export default SamplingHasilRabut;
