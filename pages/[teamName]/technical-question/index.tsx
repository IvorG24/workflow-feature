// Imports
import { checkIfGroupMember } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import TechnicalQuestionnairePage from "@/components/TechnicalQuestionnairePage/TechnicalQuestionnairePage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, userActiveTeam }) => {
    try {
      const iSHumanResourcesMember = await checkIfGroupMember(supabaseClient, {
        userId: user.id,
        groupName: [
          "HUMAN RESOURCES",
          "HUMAN RESOURCES VIEWER",
          "HUMAN RESOURCES COORDINATOR",
        ],
        teamId: userActiveTeam.team_id,
      });
      if (!iSHumanResourcesMember) {
        return {
          redirect: {
            destination: "/401",
            permanent: false,
          },
        };
      }
      return {
        props: {},
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

const Page = () => {
  return (
    <>
      <Meta
        description="Technical Question Page"
        url="/teamName/technical-question"
      />
      <TechnicalQuestionnairePage />
    </>
  );
};

export default Page;
Page.Layout = "APP";
