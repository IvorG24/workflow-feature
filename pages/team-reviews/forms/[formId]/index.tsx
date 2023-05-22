import Meta from "@/components/Meta/Meta";
import ReviewFormPage from "@/components/ReviewFormPage/ReviewFormPage";

const Page = () => {
  return (
    <>
      <Meta description="Form Page" url="/team-reviews/forms/[formId]" />
      <ReviewFormPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
