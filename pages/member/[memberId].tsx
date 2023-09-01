import { getTeamMemberOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TeamMemberPage from "@/components/TeamMemberPage/TeamMemberPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberOnLoad } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const member = await getTeamMemberOnLoad(supabaseClient, {
        teamMemberId: `${context.query.memberId}`,
      });

      return {
        props: member,
      };
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = TeamMemberOnLoad;

const Page = ({
  member,
  groupList,
  groupCount,
  projectList,
  projectCount,
}: Props) => {
  return (
    <>
      <Meta description="User Profile Page" url="/member/<memberId>" />
      <TeamMemberPage
        member={member}
        groupList={groupList}
        groupCount={groupCount}
        projectList={projectList}
        projectCount={projectCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
