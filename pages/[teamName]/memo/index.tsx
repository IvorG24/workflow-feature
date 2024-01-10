import { getTeamMemoCount, getUser } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user: { id }, userActiveTeam }) => {
    try {
      const user = await getUser(supabaseClient, {
        userId: id,
      });

      if (!user) {
        return {
          redirect: {
            destination: "/sign-in",
            permanent: false,
          },
        };
      }

      const teamMemoCount = await getTeamMemoCount(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { user, teamMemoCount },
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

const Page = () => {
  return (
    <>
      <Meta description="Create Memo Page" url="/teamName/memo/" />
      Memo List
    </>
  );
};

export default Page;
Page.Layout = "APP";
