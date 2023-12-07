import { getTeam } from "@/backend/api/get";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, teamId }) => {
    try {
      const currentTeam = await getTeam(supabaseClient, { teamId });

      if (!currentTeam) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }

      const teamName = currentTeam.team_name;
      const formattedTeamName = teamName.replace(/\s+/g, "-").toLowerCase();

      if (formattedTeamName) {
        return {
          redirect: {
            destination: `/${formattedTeamName}/dashboard`,
            permanent: false,
          },
        };
      }

      return {
        props: {
          teamName,
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

// Our Landing Page.
const Page = () => {
  return null;
};

export default Page;
Page.Layout = "HOME";
