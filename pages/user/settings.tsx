import Meta from "@/components/Meta/Meta";
import UserSettingsPage from "@/components/UserSettingsPage/UserSettingsPage";

const Page = () => {
  return (
    <>
      <Meta description="User Settings Page" url="/user/settings" />
      <UserSettingsPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
