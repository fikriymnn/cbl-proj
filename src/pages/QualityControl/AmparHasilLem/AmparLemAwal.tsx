import CheckSheetCetakAwal from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakAwal';
import JenisCetakMesin from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/JenisCetak';
import CheckSheetAmparHasilLem from '../../../components/Tables/QualityControl/QualityInspection/AmparHasilLem/CheckSheetAmparHasilLemAwal';
import DefaultLayout from '../../../layout/DefaultLayout';

const RabutAwal = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Inspeksi Quality &gt; Sampling Hasil Rabut &gt; Awal
      </p>

      <CheckSheetAmparHasilLem />
    </DefaultLayout>
  );
};

export default RabutAwal;
