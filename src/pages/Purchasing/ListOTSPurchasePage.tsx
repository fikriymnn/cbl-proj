import ListOTSPurchase from '../../components/Tables/Purchasing/ListOTSPurchase';
import DefaultLayout from '../../layout/DefaultLayout';

const ListOTSPurchasePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; List OTS Purchase
      </p>
      <ListOTSPurchase />
    </DefaultLayout>
  );
};

export default ListOTSPurchasePage;
