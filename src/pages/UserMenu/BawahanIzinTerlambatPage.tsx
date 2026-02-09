import IzinTerlambatBawahan from '../../components/Tables/UserMenu/Submission/IzinTerlambatBawahan';
import DefaultLayout from '../../layout/DefaultLayout';

const BawahanIzinTerlambatPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        User Menu &gt; Izin Terlambat
      </p>
      <IzinTerlambatBawahan />
    </DefaultLayout>
  );
};

export default BawahanIzinTerlambatPage;
