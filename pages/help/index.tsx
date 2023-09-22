// Imports
import HelpPage from "@/components/HelpPage/HelpPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Formsly Help Page" url="/help" />
      <HelpPage />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
