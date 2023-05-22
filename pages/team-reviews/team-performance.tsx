import Meta from "@/components/Meta/Meta";
import TeamPerformancePage from "@/components/TeamPerformancePage/TeamPerformancePage";

const Page = () => {
  return (
    <>
      <Meta
        description="Team Performance Page"
        url="/team-reviews/team-performance"
      />
      <TeamPerformancePage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
