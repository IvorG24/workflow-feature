import CreateReviewPage from "@/components/CreateReviewPage/CreateReviewPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta
        description="Create Review Page"
        url="/team-reviews/forms/[formId]/create"
      />
      <CreateReviewPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
