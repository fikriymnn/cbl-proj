import KonfirmasiDO from '../../components/Tables/DO/KonfirmasiDO';
import DefaultLayout from '../../layout/DefaultLayout';

const KonfirmasiDOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        DO &gt; Konfirmasi DO
      </p>
      <KonfirmasiDO />
    </DefaultLayout>
  );
};

export default KonfirmasiDOPage;
