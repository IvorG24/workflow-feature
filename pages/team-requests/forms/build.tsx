import BuildRequestFormPage from "@/components/BuildRequestFormPage/BuildRequestFormPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Build Request Page" url="/team-requests/forms/build" />
      <BuildRequestFormPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
