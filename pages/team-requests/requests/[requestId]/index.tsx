import { getTeam } from "@/backend/api/get";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ supabaseClient, context, teamId }) => {
      try {
        const activeTeam = await getTeam(supabaseClient, { teamId });

        if (activeTeam) {
          return {
            redirect: {
              destination: `/${formatTeamNameToUrlKey(
                activeTeam.team_name
              )}/requests/${context.query.requestId}`,
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
