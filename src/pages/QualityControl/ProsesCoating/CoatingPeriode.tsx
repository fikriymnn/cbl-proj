import CheckSheetCoatingAwal from '../../../components/Tables/QualityControl/QualityInspection/ProsesCoating/CheckSheetCoatingAwal';
import CheckSheetCoatingPeriode from '../../../components/Tables/QualityControl/QualityInspection/ProsesCoating/CheckSheetCoatingPeriode';
import CheckSheetPondAwal from '../../../components/Tables/QualityControl/QualityInspection/ProsesPond/CheckSheetPondAwal';
import DefaultLayout from '../../../layout/DefaultLayout';

const CoatingPeriode = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Inspeksi Quality &gt; Proses Coating &gt; Periode
      </p>

      <CheckSheetCoatingPeriode />
    </DefaultLayout>
  );
};

export default CoatingPeriode;
