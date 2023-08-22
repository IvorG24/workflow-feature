import Meta from "@/components/Meta/Meta";
import RequestAnalyticsPage from "@/components/RequestAnalyticsPage/RequestAnalyticsPage";

const Page = () => {
  return (
    <>
      <Meta
        description="Analytics Page"
        url="/team-requests/requests/analytics"
      />
      <RequestAnalyticsPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
