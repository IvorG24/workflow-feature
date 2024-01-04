import { getTeamMemberList, getUserActiveTeamId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import UserItemAnalyticsPage from "@/components/UserItemAnalyticsPage/UserItemAnalyticsPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { TeamMemberType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      const teamMemberList = await getTeamMemberList(supabaseClient, {
        teamId,
      });

      return {
        props: {
          teamMemberList,
        },
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

type Props = {
  teamMemberList: TeamMemberType[];
};

const Page = ({ teamMemberList }: Props) => {
  return (
    <>
      <Meta
        description="Item Analytics Page"
        url="/{teamName}/item-analytics"
      />
      <UserItemAnalyticsPage teamMemberList={teamMemberList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
