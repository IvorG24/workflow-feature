import MemberPage from "@/components/MemberPage/MemberPage";
import Meta from "@/components/Meta/Meta";

const Page = () => {
  return (
    <>
      <Meta description="Member Page" url="/team-reviews/members/[userId]" />
      <MemberPage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
