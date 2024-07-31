import { getTeamMemoSignerList, getUser } from "@/backend/api/get";
import CreateMemoFormPage from "@/components/Memo/CreateMemoFormPage";
import Meta from "@/components/Meta/Meta";
import { withActiveTeam } from "@/utils/server-side-protections";
import { MemoSignerItem, UserTableRow } from "@/utils/types";
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
      const teamMemoSignerList = await getTeamMemoSignerList(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { user, teamMemoSignerList },
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

type Props = {
  user: UserTableRow;
  teamMemoSignerList: MemoSignerItem[];
};

const Page = ({ user, teamMemoSignerList }: Props) => {
  return (
    <>
      <Meta description="Create Memo Page" url="/teamName/memo/" />
      <CreateMemoFormPage user={user} teamMemoSignerList={teamMemoSignerList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
