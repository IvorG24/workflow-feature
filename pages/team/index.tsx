import Meta from "@/components/Meta/Meta";
import TeamPage from "@/components/TeamPage/TeamPage";

const Page = () => {
  return (
    <>
      <Meta description="Team Page" url="/team" />
      <TeamPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
