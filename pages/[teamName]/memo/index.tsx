import { getTeamMemoCount, getUser } from "@/backend/api/get";
import CreateMemoFormPage from "@/components/Memo/CreateMemoFormPage";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { UserTableRow } from "@/utils/types";
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

type Props = {
  user: UserTableRow;
  teamMemoCount: number;
};

const Page = ({ user, teamMemoCount }: Props) => {
  return (
    <>
      <Meta description="Create Memo Page" url="/teamName/memo/" />
      <CreateMemoFormPage user={user} teamMemoCount={teamMemoCount} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
