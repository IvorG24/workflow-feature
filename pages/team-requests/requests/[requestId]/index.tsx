import { getFormslyId, getTeam } from "@/backend/api/get";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ supabaseClient, context, teamId }) => {
      try {
        const activeTeam = await getTeam(supabaseClient, { teamId });
        const formslyId = await getFormslyId(supabaseClient, {
          requestId: `${context.query.requestId}`,
        });

        if (activeTeam) {
          return {
            redirect: {
              destination: `/${formatTeamNameToUrlKey(
                activeTeam.team_name
              )}/requests/${formslyId ?? context.query.requestId}`,
              permanent: false,
            },
          };
        } else {
          return {
            redirect: {
              destination: `/create-team`,
              permanent: false,
            },
          };
        }
      } catch (e) {
        console.error(e);
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
  return null;
};

export default Page;
Page.Layout = "APP";
