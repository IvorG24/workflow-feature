import MemberListPage from "@/components/MemberListPage/MemberListPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Member List Page" url="/team-reviews/members" />
      <MemberListPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
