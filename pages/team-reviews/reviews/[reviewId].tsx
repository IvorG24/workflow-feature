import Meta from "@/components/Meta/Meta";
import ReviewPage from "@/components/ReviewPage/ReviewPage";

const Page = () => {
  return (
    <>
      <Meta description="Review Page" url="/team-reviews/reviews/[reviewId]" />
      <ReviewPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
