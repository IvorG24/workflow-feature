import {
  getAllTeamMembers,
  getRequestListByForm,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Dashboard from "@/components/Dashboard/Dashboard";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestByFormType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) throw Error;

      const { data, count } = await getRequestListByForm(supabaseClient, {
        teamId: teamId,
      });

      const teamMemberList = await getAllTeamMembers(supabaseClient, {
        teamId,
      });

      return {
        props: {
          requestList: data,
          requestListCount: count,
          teamMemberList,
          teamId,
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
  requestList: RequestByFormType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamId: string;
};

const Page = ({
  requestList,
  requestListCount,
  teamMemberList,
  teamId,
}: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <Dashboard
        requestList={requestList}
        requestListCount={requestListCount}
        teamMemberList={teamMemberList}
        teamId={teamId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
