import ListCOA from '../../components/Tables/Accounting/ListCOA';
import DefaultLayout from '../../layout/DefaultLayout';

const ListCOAPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; Chart of Accounts
      </p>
      <ListCOA />
    </DefaultLayout>
  );
};

export default ListCOAPage;
