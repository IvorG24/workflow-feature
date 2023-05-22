import Meta from "@/components/Meta/Meta";
import ReviewListPage from "@/components/ReviewListPage/ReviewListPage";

const Page = () => {
  return (
    <>
      <Meta description="Review List Page" url="/team-reviews/reviews" />
      <ReviewListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
