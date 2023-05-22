import Meta from "@/components/Meta/Meta";
import ReviewFormlistPage from "@/components/ReviewFormListPage/ReviewFormListPage";

const Page = () => {
  return (
    <>
      <Meta description="Form List Page" url="/team-reviews/forms/" />
      <ReviewFormlistPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
