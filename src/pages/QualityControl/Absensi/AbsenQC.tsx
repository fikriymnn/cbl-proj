import TabAbsen from '../../../components/Tables/QualityControl/AbsenQC/TabAbsen';
import DefaultLayout from '../../../layout/DefaultLayout';

const AbsenQC = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Absensi
      </p>

      <TabAbsen />
    </DefaultLayout>
  );
};

export default AbsenQC;
