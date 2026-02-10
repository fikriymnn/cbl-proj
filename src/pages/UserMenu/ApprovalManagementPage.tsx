import TabApprovalManagement from '../../components/Tables/UserMenu/ApprovalManagement/TabApprovalManagement';
import DefaultLayout from '../../layout/DefaultLayout';

const ApprovalManagementPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        User Menu &gt; Approval Management
      </p>
      <TabApprovalManagement />
    </DefaultLayout>
  );
};

export default ApprovalManagementPage;
