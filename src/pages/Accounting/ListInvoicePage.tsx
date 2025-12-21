import ListApprovalInvoice from '../../components/Tables/Accounting/Invoice/ListApprovalInvoice';

import DefaultLayout from '../../layout/DefaultLayout';

const ListApprovalInvoicePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Request Invoice
      </p>
      <ListApprovalInvoice />
    </DefaultLayout>
  );
};

export default ListApprovalInvoicePage;
