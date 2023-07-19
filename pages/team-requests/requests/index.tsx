// Imports
import {
  checkIfTeamHaveFormslyForms,
  getAllTeamMembers,
  getFormList,
  getUserActiveTeamId,
} from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import RequestListPage from "@/components/RequestListPage/RequestListPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberWithUserType } from "@/utils/types";
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

      const [teamMemberList, formList, isFormslyTeam] = await Promise.all([
        getAllTeamMembers(supabaseClient, {
          teamId,
        }),
        getFormList(supabaseClient, { teamId, app: "REQUEST" }),
        checkIfTeamHaveFormslyForms(supabaseClient, { teamId }),
      ]);

      return {
        props: {
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
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

const Page = ({ teamMemberList, formList, isFormslyTeam }: Props) => {
  return (
    <>
      <Meta description="Request List Page" url="/team-requests/requests" />
      <RequestListPage
        teamMemberList={teamMemberList}
        formList={formList}
        isFormslyTeam={isFormslyTeam}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
