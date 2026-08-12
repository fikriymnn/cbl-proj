import POHistory from '../../components/Tables/Purchasing/POHistory';
import DefaultLayout from '../../layout/DefaultLayout';

const POHistoryPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; PO History
      </p>
      <POHistory />
    </DefaultLayout>
  );
};

export default POHistoryPage;
