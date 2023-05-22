import CreateTeamPage from "@/components/CreateTeamPage/CreateTeamPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Create Team Page" url="/team/create" />
      <CreateTeamPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
