import Meta from "@/components/Meta/Meta";
import RequestFormListPage from "@/components/RequestFormListPage/RequestFormListPage";

const Page = () => {
  return (
    <>
      <Meta description="Form List Page" url="/team-requests/forms/" />
      <RequestFormListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
