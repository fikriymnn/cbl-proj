import TabAtasan from '../../components/Tables/UserMenu/TabTerlambatAtasan';
import DefaultLayout from '../../layout/DefaultLayout';

const AtasanIzinTerlambatPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        User Menu &gt; Izin Terlambat
      </p>
      <TabAtasan />
    </DefaultLayout>
  );
};

export default AtasanIzinTerlambatPage;
