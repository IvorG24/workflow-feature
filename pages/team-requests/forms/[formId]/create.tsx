import CreateRequestPage from "@/components/CreateRequestPage/CreateRequestPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta
        description="Create Request Page"
        url="/team-requests/forms/[formId]/create"
      />
      <CreateRequestPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
