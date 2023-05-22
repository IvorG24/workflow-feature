import BuildReviewFormPage from "@/components/BuildReviewFormPage/BuildReviewFormPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Form Builder Page" url="/team-reviews/forms/build" />
      <BuildReviewFormPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
