import DefaultLayout from '../../../layout/DefaultLayout';
import ListGR from '../../../components/Tables/Accounting/InvoiceAP/ListGR';

const ListGRPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List GR
      </p>
      <ListGR />
    </DefaultLayout>
  );
};

export default ListGRPage;
