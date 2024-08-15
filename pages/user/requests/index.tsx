// Imports
import Meta from "@/components/Meta/Meta";
import UserRequestListPage from "@/components/UserRequestListPage/UserRequestListPage";

const Page = () => {
  return (
    <>
      <Meta description="UserRequest List Page" url="/user/requests" />
      <UserRequestListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
