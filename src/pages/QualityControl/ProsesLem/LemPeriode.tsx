import CheckSheetCetakPeriode from '../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakPeriode';
import CheckSheetLemPeriode from '../../../components/Tables/QualityControl/QualityInspection/ProsesLem/CheckSheetLemPeriode';
import DefaultLayout from '../../../layout/DefaultLayout';

const LemPeriode = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Inspeksi Quality &gt; Proses Lem &gt; Periode
      </p>

      <CheckSheetLemPeriode />
    </DefaultLayout>
  );
};

export default LemPeriode;
