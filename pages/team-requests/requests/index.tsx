import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";

const Page = () => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
