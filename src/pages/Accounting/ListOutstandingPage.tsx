import ListOutstanding from '../../components/Tables/Accounting/Outstanding/ListOutstanding';
import DefaultLayout from '../../layout/DefaultLayout';

const ListOutstandingPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Outstanding
      </p>
      <ListOutstanding />
    </DefaultLayout>
  );
};

export default ListOutstandingPage;
