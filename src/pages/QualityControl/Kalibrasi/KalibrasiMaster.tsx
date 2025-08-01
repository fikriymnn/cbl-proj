import KalibrasiMasterPage from '../../../components/Tables/QualityControl/KalibrasiAlatUkur/KalibrasiMasterpage';
import DefaultLayout from '../../../layout/DefaultLayout';

const KalibrasiMaster = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Kalibrasi Alat Ukur Master
      </p>
      <KalibrasiMasterPage />
    </DefaultLayout>
  );
};

export default KalibrasiMaster;
