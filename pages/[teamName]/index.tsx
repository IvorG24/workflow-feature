import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ userActiveTeam, context }) => {
    try {
      const formattedTeamName = userActiveTeam.team_name
        .replace(/\s+/g, "-")
        .toLowerCase();

      if (formattedTeamName !== context.query.teamName || !formattedTeamName) {
        return {
          redirect: {
            destination: `/`,
            permanent: false,
          },
        };
      }

      return {
        redirect: {
          destination: `/${formattedTeamName}/dashboard`,
          permanent: false,
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
