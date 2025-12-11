import ListAllInvoice from '../../components/Tables/Accounting/Invoice/ListAllInvoice';
import DefaultLayout from '../../layout/DefaultLayout';

const ListAllInvoicePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List All Invoice
      </p>
      <ListAllInvoice />
    </DefaultLayout>
  );
};

export default ListAllInvoicePage;
