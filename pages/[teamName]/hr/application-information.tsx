// Imports
import HRApplicationListPage from "@/components/HRApplicationListPage/HRApplicationListPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta
        description="HR Application List Page"
        url="/<teamName>/hr/application-information"
      />
      <HRApplicationListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
