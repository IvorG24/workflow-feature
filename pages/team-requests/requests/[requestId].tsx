import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";

const Page = () => {
  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />
      <RequestPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
