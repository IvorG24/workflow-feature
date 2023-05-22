import Meta from "@/components/Meta/Meta";
import RequestFormPage from "@/components/RequestFormPage/RequestFormPage";

const Page = () => {
  return (
    <>
      <Meta description="Request Page" url="/team-requests/forms/[formId]" />
      <RequestFormPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
