import DefaultLayout from '../../../layout/DefaultLayout';
import ListInvoiceAP from '../../../components/Tables/Accounting/InvoiceAP/ListInvoiceAP';

const ListInvoiceApproveAPPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Invoice Approve AP
      </p>
      <ListInvoiceAP mode={'approval'} />
    </DefaultLayout>
  );
};

export default ListInvoiceApproveAPPage;
