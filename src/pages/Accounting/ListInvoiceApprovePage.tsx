import ListApprovingInvoiceTabs from '../../components/Tables/Accounting/Invoice/ListApprovingInvoiceTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const ListInvoiceApprovePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Invoice Approve
      </p>
      <ListApprovingInvoiceTabs />
    </DefaultLayout>
  );
};

export default ListInvoiceApprovePage;
