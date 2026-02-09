import TabUserMenu from '../../components/Tables/UserMenu/TabUserMenu';
import DefaultLayout from '../../layout/DefaultLayout';

const UserMenuPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        User Menu &gt; Submission
      </p>
      <TabUserMenu />
    </DefaultLayout>
  );
};

export default UserMenuPage;
