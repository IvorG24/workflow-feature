// Imports
import {
  checkIfTeamHaveFormslyForms,
  getAllTeamMembers,
  getFormList,
  getRequestList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestListItemType, TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user }) => {
    try {
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) {
        return {
          redirect: {
            destination: "/team/create",
            permanent: false,
          },
        };
      }

      const [requestList, teamMemberList, formList, isFormslyTeam] =
        await Promise.all([
          getRequestList(supabaseClient, {
            teamId: teamId,
            page: 1,
            limit: DEFAULT_REQUEST_LIST_LIMIT,
          }),
          getAllTeamMembers(supabaseClient, {
            teamId,
          }),
          getFormList(supabaseClient, { teamId, app: "REQUEST" }),
          checkIfTeamHaveFormslyForms(supabaseClient, { teamId }),
        ]);

      return {
        props: {
          requestList: requestList.data,
          requestListCount: requestList.count,
          teamMemberList,
          formList: formList.map((form) => {
            return { label: form.form_name, value: form.form_id };
          }),
          isFormslyTeam,
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
  requestList: RequestListItemType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

const Page = ({
  requestList,
  requestListCount,
  teamMemberList,
  formList,
  isFormslyTeam,
}: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage
        teamMemberList={teamMemberList}
        formList={formList}
        isFormslyTeam={isFormslyTeam}
        requestList={requestList}
        requestListCount={requestListCount}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
