import TabOutsourcingBJ from '../../../components/Tables/QualityControl/QualityInspection/OutsourcingBJ/TabOutsourcingBJ';
import ProsesCetakMesin from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/ProsesCetakMesin';
import TabCetak from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/TabCetak';
import TabSamplingHasilRabut from '../../../components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/TabSamplingHasilRabut';
import DefaultLayout from '../../../layout/DefaultLayout';

const FinalInspection = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Outsourcing Barang Jadi{' '}
      </p>

      <TabOutsourcingBJ />
    </DefaultLayout>
  );
};

export default FinalInspection;
