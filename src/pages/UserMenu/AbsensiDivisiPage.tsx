import AbsensiDivisi from '../../components/Tables/UserMenu/AbsensiDivisi';
import DefaultLayout from '../../layout/DefaultLayout';

const AbsensiDivisiPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        User Menu &gt; Absensi Divisi
      </p>
      <AbsensiDivisi />
    </DefaultLayout>
  );
};

export default AbsensiDivisiPage;
