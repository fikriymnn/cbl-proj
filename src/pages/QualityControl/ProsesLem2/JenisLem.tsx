import JenisLemMesin from '../../../components/Tables/QualityControl/QualityInspection/ProsesLem/JenisLem';
import DefaultLayout from '../../../layout/DefaultLayout';

const JenisLem = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Inspeksi Quality &gt; Proses Lem
      </p>

      <JenisLemMesin />
    </DefaultLayout>
  );
};

export default JenisLem;
