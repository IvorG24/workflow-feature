import {
  getAllTeamMembers,
  getRequestList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Dashboard from "@/components/Dashboard/Dashboard";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) throw Error;

      const { data, count } = await getRequestList(supabaseClient, {
        teamId: teamId,
        page: 1,
        limit: 9999999,
      });

      const teamMemberList = await getAllTeamMembers(supabaseClient, {
        teamId,
      });

      return {
        props: {
          requestList: data,
          requestListCount: count,
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
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const Page = ({ requestList, requestListCount, teamMemberList }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <Dashboard
        requestList={requestList}
        requestListCount={requestListCount}
        teamMemberList={teamMemberList}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
