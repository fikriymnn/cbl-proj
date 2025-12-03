import ListJoSelesai from '../../../components/Tables/Produksi/LKH/MonitoringLKH/ListJoSelesai';
import DefaultLayout from '../../../layout/DefaultLayout';

const ListJOSelesaiPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; List JO Selesai
      </p>
      <ListJoSelesai />
    </DefaultLayout>
  );
};

export default ListJOSelesaiPage;
