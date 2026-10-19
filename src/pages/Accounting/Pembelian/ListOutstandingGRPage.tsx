import DefaultLayout from '../../../layout/DefaultLayout';
import ListOutstandingGR from '../../../components/Tables/Accounting/InvoiceAP/ListOutstandingGR';

const ListOutstandingGRPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Outstanding GR
      </p>
      <ListOutstandingGR />
    </DefaultLayout>
  );
};

export default ListOutstandingGRPage;
