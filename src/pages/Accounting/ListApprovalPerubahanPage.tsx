import ListApprovalPerubahan from '../../components/Tables/Accounting/Invoice/ListApprovalPerubahan';
import DefaultLayout from '../../layout/DefaultLayout';

const ListApprovalPerubahanPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Approval Perubahan
      </p>
      <ListApprovalPerubahan />
    </DefaultLayout>
  );
};

export default ListApprovalPerubahanPage;
