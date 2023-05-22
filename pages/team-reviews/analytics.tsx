import Meta from "@/components/Meta/Meta";
import ReviewAnalyticsPage from "@/components/ReviewAnalyticsPage/ReviewAnalyticsPage";

const Page = () => {
  return (
    <>
      <Meta description="Analytics Page" url="/team-reviews/analytics" />
      <ReviewAnalyticsPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
