import TabAbsenProd from '../../components/Tables/Produksi/Absensi/TabAbsenProd';
import DefaultLayout from '../../layout/DefaultLayout';

const AbsenProduction = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Absensi
      </p>
      <TabAbsenProd />
    </DefaultLayout>
  );
};

export default AbsenProduction;
